import { Router, Request, Response } from "express";
import { scrapeIFBenin } from "../features/events/scraper/ifBeninScraper";
import { scrapeCultures } from "../features/events/scraper/culturesScraper";
import { scrapeEventBooster } from "../features/events/scraper/eventBooster";

export const scrapeRouter = Router();

scrapeRouter.get("/", async (_req: Request, res: Response) => {
  try {
    await scrapeIFBenin();
    await scrapeEventBooster();
    await scrapeCultures();

    res.json({ message: "Scraping completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Scraping failed" });
  }
});
