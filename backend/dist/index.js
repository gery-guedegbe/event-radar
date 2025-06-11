"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const events_1 = require("./api/events");
const scrape_1 = require("./api/scrape");
const cron_1 = require("./utils/cron");
const upload_1 = require("./api/upload");
const multer = require("multer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Enlève l’en-tête X-Powered-By pour masquer qu’on utilise Express
app.disable("x-powered-by");
// Sécurise les headers HTTP
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configure CORS pour autoriser uniquement ton frontend Next.js
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: false, // on n’utilise pas (pour l’instant) de cookies/auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// imite le nombre de requêtes / IP (anti-brute-force / DDoS léger)
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requêtes par IP sur 15 min
    standardHeaders: true,
    legacyHeaders: false,
}));
// Middleware pour vérifier la connexion à la base
app.use(async (req, res, next) => {
    try {
        await db_1.prisma.$queryRaw `SELECT 1`;
        next();
    }
    catch (error) {
        console.error("Database connection error details:", {
            error: error.message,
            databaseUrl: process.env.DATABASE_URL?.replace(/\/\/.*@/, "//[REDACTED]@"), // Masque le mot de passe dans les logs
        });
        res.status(500).json({
            error: "Database connection failed",
            details: "Check server logs for more information",
        });
    }
});
// Routes publiques (événements & scraping)
app.use("/api/events", events_1.eventRouter);
app.use("/api/upload", upload_1.uploadRouter);
app.use("/api/scrape", scrape_1.scrapeRouter);
// Health check
app.get("/health", async (_req, res) => {
    const dbStatus = await db_1.prisma.$queryRaw `SELECT 1`
        .then(() => "connected")
        .catch(() => "disconnected");
    res.json({
        status: "up",
        database: dbStatus,
        supabase: db_1.supabase ? "connected" : "disconnected",
    });
});
// Gestion des erreurs 404
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});
// Gestion d’erreur générique
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});
// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    (0, cron_1.scheduleJobs)();
});
