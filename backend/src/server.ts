// =============================================================
// Orbi Backend — Express Server Entry Point
// GrimmForged AI Solutions
// =============================================================

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDatabase, getDbStatus } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

// Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";
import chatRoutes from "./routes/chat";
import focusRoutes from "./routes/focus";
import reminderRoutes from "./routes/reminders";
import calendarRoutes from "./routes/calendar";
import subscriptionRoutes from "./routes/subscriptions";
import webhookRoutes from "./routes/webhooks";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

// -----------------------------------------------------------
// Boot-time env audit (logged once, never crashes)
// -----------------------------------------------------------
function logEnvAudit(): void {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const optional = [
    "WEB_URL",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_AGENT",
    "STRIPE_PRICE_FULL",
    "STRIPE_WEBHOOK_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];
  const present = (k: string) => (process.env[k] ? "set" : "MISSING");
  console.log("Orbi backend env audit:");
  for (const k of required) console.log(`  [required] ${k}: ${present(k)}`);
  for (const k of optional) console.log(`  [optional] ${k}: ${present(k)}`);
}

// -----------------------------------------------------------
// Security Middleware
// -----------------------------------------------------------
app.use(helmet());

const staticAllowedOrigins = new Set([
  process.env.WEB_URL || "http://localhost:5173",
  "http://localhost:5173",
  "https://grimmforged.ca",
  "https://www.grimmforged.ca",
  "tauri://localhost",
  "http://tauri.localhost",
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (staticAllowedOrigins.has(origin)) return callback(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Stripe webhook needs raw body — register BEFORE json parser
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json({ limit: "1mb" }));

// -----------------------------------------------------------
// Rate Limiting
// -----------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many AI requests, slow down a bit!" },
});

app.use("/api", globalLimiter);
app.use("/api/chat", aiLimiter);

// -----------------------------------------------------------
// Health & Readiness (no auth)
// -----------------------------------------------------------
// /health = liveness: process is up. Render uses this to decide if it's running.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "orbi-backend", timestamp: new Date().toISOString() });
});

// /ready = readiness: dependencies (Postgres) are usable.
app.get("/ready", (_req, res) => {
  const db = getDbStatus();
  const ok = db.status === "connected";
  res.status(ok ? 200 : 503).json({
    status: ok ? "ready" : "not-ready",
    db: db.status,
    dbError: db.lastError,
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------
// Public Routes (no auth)
// -----------------------------------------------------------
app.use("/api/auth", authRoutes);

// -----------------------------------------------------------
// Protected Routes (auth required)
// -----------------------------------------------------------
app.use("/api", authMiddleware);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// -----------------------------------------------------------
// Global Error Handler
// -----------------------------------------------------------
app.use(errorHandler);

// -----------------------------------------------------------
// Start
// -----------------------------------------------------------
logEnvAudit();

// Listen FIRST so /health responds even if Postgres is misconfigured.
app.listen(PORT, HOST, () => {
  console.log(`Orbi backend listening on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Connect Postgres in background with retry. Do NOT exit on failure —
// /ready will report the bad state, /health stays green so the platform
// keeps the container alive and you can see logs.
async function connectWithRetry(): Promise<void> {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await connectDatabase();
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Postgres connect attempt ${attempt}/${maxAttempts} failed: ${msg}`);
      if (attempt === maxAttempts) {
        console.error("Postgres unreachable. /ready will return 503 until this is fixed.");
        return;
      }
      const backoffMs = Math.min(30_000, 2_000 * 2 ** (attempt - 1));
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

void connectWithRetry();

export default app;
