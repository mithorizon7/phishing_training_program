export function resolveAuthOrigin(hostHeader: string | undefined, env: NodeJS.ProcessEnv = process.env): string | null {
  if (!hostHeader || /[\s/@?#\\]/.test(hostHeader)) return null;
  try {
    const url = new URL(`http://${hostHeader}`);
    const normalize = (host: string) => host.toLowerCase().replace(/\.$/, "").replace(/^\[(.*)\]$/, "$1");
    const hostname = normalize(url.hostname);
    const local = ["localhost", "127.0.0.1", "::1"].includes(hostname);
    if (!local && url.port && url.port !== "443") return null;
    const allowed = (env.ALLOWED_AUTH_HOSTS ?? env.REPLIT_DOMAINS ?? "")
      .split(",").map((host) => normalize(host.trim())).filter(Boolean);
    if (allowed.length ? !allowed.includes(hostname) : (env.NODE_ENV === "production" || !local)) return null;
    return new URL(`${local ? "http" : "https"}://${url.host}`).origin;
  } catch {
    return null;
  }
}
