"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL non défini dans .env");
}
// 1. PrismaClient lit directement DATABASE_URL
exports.prisma = new client_1.PrismaClient();
// {
//   log: ["query", "info", "warn", "error"],
// }
// 2. Supabase
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
