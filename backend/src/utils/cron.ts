// utils/cron.ts
import cron from "node-cron";
import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";

export function scheduleJobs() {
  // Toutes les 2 minutes (pour test - configurable via env)
  cron.schedule(process.env.SCRAPE_CRON || "0 */6 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled scraping...`);

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const port = process.env.PORT || 4000;
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

      const response = await fetch(`${baseUrl}/api/scrape`, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      console.log(`[${new Date().toISOString()}] Scraping job completed.`);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Scrape error:`,
        err instanceof Error ? err.message : err
      );
    } finally {
      clearTimeout(timeout);
    }
  });

  // Cleanup quotidien
  cron.schedule("0 0 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running cleanup...`);

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const port = process.env.PORT || 4000;
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

      const response = await fetch(`${baseUrl}/api/events/cleanup`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      console.log(`[${new Date().toISOString()}] Cleanup completed`);
    } catch (err) {
      console.error(
        `[${new Date().toISOString()}] Cleanup error:`,
        err instanceof Error ? err.message : err
      );
    } finally {
      clearTimeout(timeout);
    }
  });
}
