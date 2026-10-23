import express, { type Express, type ErrorRequestHandler } from "express";

export function positiveInteger(raw: string | undefined, fallback: number, ceiling = 1_000_000): number {
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 && value <= ceiling ? value : fallback;
}

export function installSecurity(
  app: Express,
  env: NodeJS.ProcessEnv = process.env,
  log: (message: string) => void = console.log,
) {
  const production = env.NODE_ENV === "production";
  const windowMs = positiveInteger(env.API_RATE_LIMIT_WINDOW_MS, 60_000, 3_600_000);
  const maximum = positiveInteger(env.API_RATE_LIMIT_MAX, 120);
  const maxClients = positiveInteger(env.API_RATE_LIMIT_MAX_CLIENTS, 10_000, 100_000);
  const buckets = new Map<string, { count: number; start: number }>();

  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    if (production) {
      res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      res.set("Content-Security-Policy", [
        "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data: https:",
        "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'",
      ].join("; "));
    }
    next();
  });

  app.use("/api", (req, res, next) => {
    const started = Date.now();
    res.set("Cache-Control", "no-store");
    res.on("finish", () => {
      // Route templates exclude user-controlled parameters and query-string secrets.
      const route = typeof req.route?.path === "string" ? req.route.path : "/api/[unmatched]";
      log(`${req.method} ${route} ${res.statusCode} in ${Date.now() - started}ms`);
    });

    const client = req.ip || req.socket.remoteAddress || "unknown";
    let bucket = buckets.get(client);
    if (!bucket || started - bucket.start >= windowMs) {
      if (!bucket && buckets.size >= maxClients) {
        const oldest = buckets.keys().next().value;
        if (oldest !== undefined) buckets.delete(oldest);
      }
      bucket = { count: 0, start: started };
      buckets.set(client, bucket);
    }
    if (bucket.count >= maximum) {
      res.set("Retry-After", String(Math.max(1, Math.ceil((windowMs - (started - bucket.start)) / 1000))));
      return res.status(429).json({ message: "Too many requests. Please retry shortly." });
    }
    bucket.count += 1;
    next();
  });

  // Apply limits and headers before parsing, including rejected request bodies.
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "256kb", parameterLimit: 100 }));
}

export function errorHandler(log: (message: string) => void = console.error): ErrorRequestHandler {
  return (error: unknown, _req, res, next) => {
    if (res.headersSent) return next(error);
    const details = error && typeof error === "object" ? error as { status?: unknown; statusCode?: unknown } : {};
    const raw = details.status ?? details.statusCode;
    const status = typeof raw === "number" && Number.isInteger(raw) && raw >= 400 && raw < 600 ? raw : 500;
    const message = status === 413 ? "Request body too large" : status < 500 ? "Invalid request" : "Internal Server Error";
    // Exception messages/stacks can include database URLs, credentials, or submitted data.
    log(`Request failed with status ${status}`);
    res.status(status).json({ message });
  };
}
