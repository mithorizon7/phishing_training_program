import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

function parsePositiveIntOrDefault(rawValue: string | undefined, defaultValue: number): number {
  if (rawValue === undefined) {
    return defaultValue;
  }
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }
  const normalized = Math.trunc(parsed);
  return normalized > 0 ? normalized : 0;
}

const app = express();
const httpServer = createServer(app);
const isProduction = process.env.NODE_ENV === "production";
const apiRateLimitWindowMs = parsePositiveIntOrDefault(process.env.API_RATE_LIMIT_WINDOW_MS, 60_000);
const apiRateLimitMax = parsePositiveIntOrDefault(process.env.API_RATE_LIMIT_MAX, 120);
const apiRateLimitMaxClients = parsePositiveIntOrDefault(process.env.API_RATE_LIMIT_MAX_CLIENTS, 10_000);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "256kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "256kb" }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
});

type RateBucket = { count: number; windowStart: number };
const apiRateBuckets = new Map<string, RateBucket>();

if (apiRateLimitWindowMs > 0) {
  const cleanup = setInterval(() => {
    const cutoff = Date.now() - apiRateLimitWindowMs;
    apiRateBuckets.forEach((bucket, key) => {
      if (bucket.windowStart < cutoff) {
        apiRateBuckets.delete(key);
      }
    });
  }, apiRateLimitWindowMs);

  cleanup.unref?.();
}

app.use("/api", (req, res, next) => {
  if (apiRateLimitMax <= 0 || apiRateLimitWindowMs <= 0) {
    return next();
  }

  const now = Date.now();
  const clientId = (req.ip || req.socket.remoteAddress || "unknown").toString();
  const existing = apiRateBuckets.get(clientId);

  if (!existing || now - existing.windowStart >= apiRateLimitWindowMs) {
    if (!existing && apiRateLimitMaxClients > 0 && apiRateBuckets.size >= apiRateLimitMaxClients) {
      // Bound memory growth from high-cardinality client IDs.
      const oldestTrackedClient = apiRateBuckets.keys().next().value as string | undefined;
      if (oldestTrackedClient) {
        apiRateBuckets.delete(oldestTrackedClient);
      }
    }

    apiRateBuckets.set(clientId, { count: 1, windowStart: now });
    return next();
  }

  if (existing.count >= apiRateLimitMax) {
    const retryAfterSec = Math.max(1, Math.ceil((apiRateLimitWindowMs - (now - existing.windowStart)) / 1000));
    res.setHeader("Retry-After", retryAfterSec.toString());
    return res.status(429).json({ message: "Too many requests. Please retry shortly." });
  }

  existing.count += 1;
  return next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

function serializeForLog(payload: unknown): string {
  try {
    const serialized = JSON.stringify(payload);
    if (!serialized) return "";
    return serialized.length > 800 ? `${serialized.slice(0, 800)}...[truncated]` : serialized;
  } catch {
    return "[unserializable-response]";
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse !== undefined) {
        const serialized = serializeForLog(capturedJsonResponse);
        if (serialized) {
          logLine += ` :: ${serialized}`;
        }
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    const normalized = err as { status?: number; statusCode?: number; message?: string; stack?: string };
    const rawStatus = normalized.status ?? normalized.statusCode ?? 500;
    const status = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus < 600 ? rawStatus : 500;
    const message = status >= 500 && isProduction
      ? "Internal Server Error"
      : (normalized.message || "Internal Server Error");

    const stack = normalized.stack ? `\n${normalized.stack}` : "";
    log(`Unhandled error ${status}: ${normalized.message || "unknown"}${stack}`, "error");

    res.status(status).json({ message });
    return;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
