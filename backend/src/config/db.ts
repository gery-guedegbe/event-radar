import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL non défini dans .env");
}

// 1. PrismaClient lit directement DATABASE_URL
export const prisma = new PrismaClient();

// {
//   log: ["query", "info", "warn", "error"],
// }

// 2. Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
