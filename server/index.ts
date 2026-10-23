import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { errorHandler, installSecurity, positiveInteger } from "./security";

const app = express();
const httpServer = createServer(app);
installSecurity(app);

export function log(message: string, source = "express") {
  console.log(`${new Date().toISOString()} [${source}] ${message}`);
}

async function start() {
  await registerRoutes(httpServer, app);
  app.use("/api", (_req, res) => res.status(404).json({ message: "API endpoint not found" }));

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  app.use(errorHandler());

  const port = positiveInteger(process.env.PORT, 5000, 65535);
  const host = process.env.HOST ?? (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
  httpServer.listen({ port, host }, () => log(`serving on port ${port}`));
  httpServer.on("error", () => {
    log("HTTP server failed", "error");
    process.exitCode = 1;
  });
}

start().catch(() => {
  log("Startup failed; check database connectivity and deployment configuration", "error");
  process.exit(1);
});
