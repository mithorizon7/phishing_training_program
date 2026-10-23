import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { test } from "node:test";
import express, { type Express } from "express";
import { errorHandler, installSecurity, positiveInteger } from "../server/security";
import { resolveAuthOrigin } from "../server/replit_integrations/auth/origin";

async function withServer(app: Express, run: (url: string) => Promise<void>) {
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address !== "string");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function application(env: NodeJS.ProcessEnv = {}, logs: string[] = []) {
  const app = express();
  installSecurity(app, env, (message) => logs.push(message));
  app.post("/api/example", (_req, res) => res.json({ ok: true }));
  app.get("/api/items/:id", (_req, res) => res.json({ token: "test-sensitive-response" }));
  app.get("/api/error", (_req, _res, next) => next(new Error("test-sensitive-exception")));
  app.use(errorHandler((message) => logs.push(message)));
  return app;
}

test("invalid limits preserve positive bounded defaults", () => {
  for (const value of [undefined, "", "0", "-1", "Infinity", "NaN", "1.5", "1e3", "99999999999999"]) {
    assert.equal(positiveInteger(value, 120), 120);
  }
  assert.equal(positiveInteger("10", 120), 10);
});

test("authentication origins fail closed and preserve local ports and IPv6", () => {
  assert.equal(resolveAuthOrigin("unconfigured.example", { NODE_ENV: "production" }), null);
  assert.equal(resolveAuthOrigin("localhost:5000", { NODE_ENV: "production" }), null);
  assert.equal(resolveAuthOrigin("localhost:5000", {}), "http://localhost:5000");
  assert.equal(resolveAuthOrigin("[::1]:5000", {}), "http://[::1]:5000");
  const env = { NODE_ENV: "production", ALLOWED_AUTH_HOSTS: "training.example" };
  assert.equal(resolveAuthOrigin("training.example", env), "https://training.example");
  assert.equal(resolveAuthOrigin("training.example:443", env), "https://training.example");
  assert.equal(resolveAuthOrigin("training.example:444", env), null);
  for (const host of [undefined, "other.example", "user@training.example", "training.example/path", "training.example?token=secret", "training.example\\other.example"]) {
    assert.equal(resolveAuthOrigin(host, env), null);
  }
});

test("production headers cover malformed and oversized bodies", async () => {
  await withServer(application({ NODE_ENV: "production" }), async (url) => {
    for (const [body, status] of [["{", 400], [JSON.stringify({ data: "a".repeat(270_000) }), 413]] as const) {
      const response = await fetch(`${url}/api/example`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      assert.equal(response.status, status);
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(response.headers.get("x-frame-options"), "DENY");
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.match(response.headers.get("content-security-policy") || "", /script-src 'self'/);
      assert.equal(response.headers.get("x-powered-by"), null);
    }
  });
});

test("rejected bodies consume rate allowance before parsing", async () => {
  await withServer(application({ API_RATE_LIMIT_MAX: "1" }), async (url) => {
    const options = { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" };
    assert.equal((await fetch(`${url}/api/example`, options)).status, 400);
    const rejected = await fetch(`${url}/api/example`, options);
    assert.equal(rejected.status, 429);
    assert(Number(rejected.headers.get("retry-after")) > 0);
  });
});

test("forwarded client headers cannot bypass default rate limits", async () => {
  await withServer(application({ API_RATE_LIMIT_MAX: "1" }), async (url) => {
    assert.equal((await fetch(`${url}/api/items/one`, { headers: { "X-Forwarded-For": "192.0.2.1" } })).status, 200);
    assert.equal((await fetch(`${url}/api/items/two`, { headers: { "X-Forwarded-For": "192.0.2.2" } })).status, 429);
  });
});

test("logs exclude response bodies, URL parameters and query secrets", async () => {
  const logs: string[] = [];
  await withServer(application({}, logs), async (url) => {
    const response = await fetch(`${url}/api/items/test-sensitive-id?token=test-sensitive-query`);
    assert.equal(response.status, 200);
    await response.json();
  });
  assert.match(logs.join("\n"), /GET \/api\/items\/:id 200/);
  assert.doesNotMatch(logs.join("\n"), /test-sensitive/);
});

test("internal exceptions do not leak to clients or application logs", async () => {
  const logs: string[] = [];
  await withServer(application({ NODE_ENV: "production" }, logs), async (url) => {
    const response = await fetch(`${url}/api/error`);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: "Internal Server Error" });
  });
  assert.doesNotMatch(logs.join("\n"), /test-sensitive/);
});

test("non-Error thrown values normalize safely", () => {
  for (const value of [undefined, null, "private-value", { status: 200 }, { status: "400" }]) {
    let actualStatus = 0;
    let actualBody: unknown;
    const response = { headersSent: false, status(code: number) { actualStatus = code; return this; }, json(body: unknown) { actualBody = body; } };
    errorHandler(() => {})(value, {} as never, response as never, () => assert.fail("unexpected next"));
    assert.equal(actualStatus, 500);
    assert.deepEqual(actualBody, { message: "Internal Server Error" });
  }
});
