// =============================================================
// Orbi Backend — Express Server Entry Point
// GrimmForged AI Solutions
// =============================================================

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDatabase } from "./config/database";
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
const PORT = process.env.PORT || 3001;

// -----------------------------------------------------------
// Security Middleware
// -----------------------------------------------------------
app.use(helmet());

const staticAllowedOrigins = new Set([
  process.env.WEB_URL || "http://localhost:5173",
  "http://localhost:5173",
  "https://grimmforged.ca",
  "https://www.grimmforged.ca",
  "tauri://localhost",                             // Tauri desktop app
  "http://tauri.localhost",
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / curl / mobile apps with no Origin header
    if (!origin) return callback(null, true);
    if (staticAllowedOrigins.has(origin)) return callback(null, true);
    // Vercel deployments: production + preview URLs for this project
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
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 20,                     // AI calls are expensive
  message: { success: false, error: "Too many AI requests, slow down a bit!" },
});

app.use("/api", globalLimiter);
app.use("/api/chat", aiLimiter);

// -----------------------------------------------------------
// Health Check (no auth needed)
// -----------------------------------------------------------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "orbi-backend", timestamp: new Date().toISOString() });
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
(async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`\n🔮 Orbi Backend running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}\n`);
  });
})();

export default app;
