import express, { Request, Response, NextFunction } from "express";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { prisma, supabase } from "./config/db";
import { eventRouter } from "./api/events";
import { scrapeRouter } from "./api/scrape";
import { scheduleJobs } from "./utils/cron";
import { uploadRouter } from "./api/upload";

const multer = require("multer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enlève l’en-tête X-Powered-By pour masquer qu’on utilise Express
app.disable("x-powered-by");

// Sécurise les headers HTTP
app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Configure CORS pour autoriser uniquement ton frontend Next.js
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // // Autorise les outils comme Postman ou les scripts locaux
      // if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// imite le nombre de requêtes / IP (anti-brute-force / DDoS léger)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requêtes par IP sur 15 min
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Middleware pour vérifier la connexion à la base
app.use(async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (error: any) {
    console.error("Database connection error details:", {
      error: error.message,
      databaseUrl: process.env.DATABASE_URL?.replace(
        /\/\/.*@/,
        "//[REDACTED]@"
      ), // Masque le mot de passe dans les logs
    });
    res.status(500).json({
      error: "Database connection failed",
      details: "Check server logs for more information",
    });
  }
});

// Routes publiques (événements & scraping)
app.use("/api/events", eventRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/scrape", scrapeRouter);

// Health check
app.get("/health", async (_req, res) => {
  const dbStatus = await prisma.$queryRaw`SELECT 1`
    .then(() => "connected")
    .catch(() => "disconnected");

  res.json({
    status: "up",
    database: dbStatus,
    supabase: supabase ? "connected" : "disconnected",
  });
});

// Gestion des erreurs 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Gestion d’erreur générique
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  scheduleJobs();
});
