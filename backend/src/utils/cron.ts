// src/utils/cron.ts
import cron from "node-cron";
import fetch from "node-fetch";

export function scheduleJobs() {
  // Toutes les 6 heures : lancer le scraping
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running scheduled scraping...");
    try {
      await fetch(
        `${process.env.BASE_URL || "http://localhost:" + process.env.PORT}/api/scrape`
      );

      console.log("Scraping job completed.");
    } catch (err) {
      console.error("Error during scheduled scrape:", err);
    }
  });

  // Tous les jours à minuit : cleanup > 30 jours
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled cleanup...");
    try {
      await fetch(
        `${process.env.BASE_URL || "http://localhost:" + process.env.PORT}/api/events/cleanup`,
        { method: "DELETE" }
      );

      console.log("Cleanup job completed.");
    } catch (err) {
      console.error("Error during scheduled cleanup:", err);
    }
  });
}
