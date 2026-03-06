import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, Request, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === "production";
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();
  const localhostHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const configuredHosts = new Set(
    (process.env.ALLOWED_AUTH_HOSTS ?? process.env.REPLIT_DOMAINS ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  );
  const maxDynamicStrategies = Number(process.env.AUTH_MAX_DYNAMIC_STRATEGIES ?? 5);

  const normalizeHost = (hostname: string): string => hostname
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^\[(.*)\]$/, "$1");

  const parseHostHeader = (hostHeader: string): { host: string; hostname: string } | null => {
    try {
      const parsed = new URL(`http://${hostHeader}`);
      const normalizedHostname = normalizeHost(parsed.hostname);
      if (!normalizedHostname) {
        return null;
      }
      return {
        host: parsed.host.toLowerCase(),
        hostname: normalizedHostname,
      };
    } catch {
      return null;
    }
  };

  const resolveAuthHost = (hostname: string): string | null => {
    const normalizedHost = normalizeHost(hostname);

    if (configuredHosts.size > 0) {
      return configuredHosts.has(normalizedHost) ? normalizedHost : null;
    }

    if (localhostHosts.has(normalizedHost)) {
      return normalizedHost;
    }

    if (registeredStrategies.has(`replitauth:${normalizedHost}`)) {
      return normalizedHost;
    }

    if (!Number.isFinite(maxDynamicStrategies) || maxDynamicStrategies <= 0) {
      return null;
    }

    return registeredStrategies.size < maxDynamicStrategies ? normalizedHost : null;
  };

  const resolveAllowedOrigin = (req: Request): string | null => {
    const authHost = resolveAuthHost(req.hostname);
    if (!authHost) {
      return null;
    }

    const rawHostHeader = req.get("host");
    let originHost = authHost;

    if (rawHostHeader) {
      const parsedHostHeader = parseHostHeader(rawHostHeader.trim().toLowerCase());
      if (!parsedHostHeader || parsedHostHeader.hostname !== authHost) {
        return null;
      }
      originHost = parsedHostHeader.host;
    }

    const protocol = localhostHosts.has(authHost) ? "http" : "https";
    return `${protocol}://${originHost}`;
  };

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const callbackProtocol = localhostHosts.has(domain) ? "http" : "https";
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `${callbackProtocol}://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    const authHost = resolveAuthHost(req.hostname);
    if (!authHost) {
      return res.status(400).json({ message: "Unsupported host for authentication" });
    }

    ensureStrategy(authHost);
    return passport.authenticate(`replitauth:${authHost}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const authHost = resolveAuthHost(req.hostname);
    if (!authHost) {
      return res.status(400).json({ message: "Unsupported host for authentication" });
    }

    ensureStrategy(authHost);
    return passport.authenticate(`replitauth:${authHost}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const origin = resolveAllowedOrigin(req);
    if (!origin) {
      return res.status(400).json({ message: "Unsupported host for authentication" });
    }

    return req.logout((logoutError) => {
      if (logoutError) {
        return res.status(500).json({ message: "Logout failed" });
      }

      return res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: origin,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
