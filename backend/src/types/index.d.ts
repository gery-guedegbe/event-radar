import { PrismaClient } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
      supabase: SupabaseClient;
    }
  }
}
