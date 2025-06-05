import express, { Request, Response, NextFunction } from "express";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { prisma, supabase } from "./config/db";
import { eventRouter } from "./api/events";
import { scrapeRouter } from "./api/scrape";
import { scheduleJobs } from "./utils/cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1) Enlève l’en-tête X-Powered-By pour masquer qu’on utilise Express
app.disable("x-powered-by");

// 2) Sécurise les headers HTTP
app.use(helmet());

// 3) Configure CORS pour autoriser uniquement ton frontend Next.js
app.use(
  cors({
    origin: "http://localhost:3000", // adresse de dev Next.js
    credentials: false, // on n’utilise pas (pour l’instant) de cookies/auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 4) Limite le nombre de requêtes / IP (anti-brute-force / DDoS léger)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requêtes par IP sur 15 min
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 5) Limite la taille du body JSON pour éviter les payloads géants
app.use(express.json({ limit: "100kb" }));

// 6) Middleware pour vérifier la connexion à la base
app.use(async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 7) Routes publiques (événements & scraping)
app.use("/api/events", eventRouter);
app.use("/api/scrape", scrapeRouter);

// 8) Health check
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

// 9) Gestion des erreurs 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 10) Gestion d’erreur générique
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// 11) Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  scheduleJobs();
});
