"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeRouter = void 0;
const express_1 = require("express");
const ifBeninScraper_1 = require("../features/events/scraper/ifBeninScraper");
const culturesScraper_1 = require("../features/events/scraper/culturesScraper");
const eventBooster_1 = require("../features/events/scraper/eventBooster");
exports.scrapeRouter = (0, express_1.Router)();
exports.scrapeRouter.get("/", async (_req, res) => {
    try {
        await (0, ifBeninScraper_1.scrapeIFBenin)();
        await (0, eventBooster_1.scrapeEventBooster)();
        await (0, culturesScraper_1.scrapeCultures)();
        res.json({ message: "Scraping completed" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Scraping failed" });
    }
});
