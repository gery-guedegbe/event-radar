"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCultures = scrapeCultures;
const puppeteer_1 = __importDefault(require("puppeteer"));
const db_1 = require("../../../config/db");
async function scrapeCultures() {
    // 1) Lancer Chrome headless
    const browser = await puppeteer_1.default.launch({
        // @ts-ignore
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setViewport({ width: 1280, height: 800 });
        // 2) Accéder à la page agenda
        await page.goto("https://culturesetpatrimoines.bj/agenda/", {
            waitUntil: "networkidle2",
            timeout: 30000,
        });
        // 3) Attendre le conteneur principal des événements
        try {
            await page.waitForSelector(".em-events-list", { timeout: 15000 });
        }
        catch {
            console.warn("⚠️ .em-events-list non trouvé après 15 s.");
        }
        // 4) Extraire les données “listing” sans ouvrir chaque detail
        const basicEvents = await page.evaluate(() => {
            const results = [];
            // Pour chaque bloc .em-event.em-item
            document
                .querySelectorAll(".em-event.em-item")
                .forEach((card) => {
                // 4.1 Thumbnail
                const thumbEl = card.querySelector(".em-item-image img");
                const thumbnail = thumbEl?.getAttribute("src")?.trim() || undefined;
                // 4.2 Title + link
                const aTitle = card.querySelector(".em-item-title a");
                const title = aTitle?.textContent?.trim() || "";
                const link = aTitle?.href || "";
                // 4.3 rawDate (ex: "mai 22, 2025 - juin 14, 2025")
                const dateEl = card.querySelector(".em-event-date");
                const rawDate = dateEl?.textContent?.trim() ?? "";
                // 4.4 Time (ex: "Tous les jours")
                const timeEl = card.querySelector(".em-event-time");
                const time = timeEl?.textContent?.trim() || undefined;
                // 4.5 Location
                const locEl = card.querySelector(".em-event-location a");
                const location = locEl?.textContent?.trim() || undefined;
                // 4.6 Category(s) : on concatène toutes les catégories disponibles
                const catNodes = Array.from(card.querySelectorAll(".event-categories li a"));
                const categories = catNodes
                    .map((a) => a.textContent?.trim() || "")
                    .filter((txt) => txt.length > 0);
                const category = categories.length > 0 ? categories.join(" / ") : undefined;
                if (title && link && rawDate) {
                    results.push({
                        title,
                        thumbnail,
                        link,
                        rawDate,
                        time,
                        location,
                        category,
                        source: "culturesetpatrimoines",
                    });
                }
            });
            return results;
        });
        if (basicEvents.length === 0) {
            console.warn("⚠️ Aucun événement extrait de la liste Cultures&P. ? Vérifiez les sélecteurs.");
        }
        // 5) Pour chaque événement, on va maintenant sur la page « Plus d’infos »
        //    afin de récupérer la description complète et la fullImage (grande image).
        for (const ev of basicEvents) {
            // 5.1 Extraire la date de début avant le tiret
            //     rawDate ex: "mai 22, 2025 - juin 14, 2025"
            const firstDatePart = ev.rawDate.split("-")[0].trim(); // “mai 22, 2025”
            // On convertit “mai 22, 2025” → JS Date
            const frenchMonthMap = {
                janvier: "01",
                février: "02",
                fevrier: "02",
                mars: "03",
                avril: "04",
                mai: "05",
                juin: "06",
                juillet: "07",
                août: "08",
                aout: "08",
                septembre: "09",
                octobre: "10",
                novembre: "11",
                décembre: "12",
                decembre: "12",
            };
            // On doit passer “mai 22, 2025” au format “2025-05-22”
            let parsedDate;
            try {
                const parts = firstDatePart.split(",");
                // parts[0] = "mai 22" (ou "mai 22"), parts[1] = " 2025" (avec leading space)
                const [monthDay, yearStr] = [parts[0].trim(), parts[1].trim()];
                const [rawMonth, rawDay] = monthDay.split(" ").map((s) => s.trim());
                const monthNum = frenchMonthMap[rawMonth.toLowerCase()];
                const dayNum = rawDay.replace(/\D/g, ""); // on garde les chiffres
                const yearNum = yearStr.replace(/\D/g, "");
                const iso = `${yearNum}-${monthNum}-${dayNum.padStart(2, "0")}T00:00:00`;
                parsedDate = new Date(iso);
                if (isNaN(parsedDate.getTime()))
                    throw new Error("Invalid date");
            }
            catch {
                console.warn(`⚠️ Impossible de parser la date début pour "${ev.title}" : "${ev.rawDate}"`);
                continue;
            }
            // 5.2 Vérifier si déjà en base (title + date + source)
            const already = await db_1.prisma.event.findFirst({
                where: {
                    title: ev.title,
                    date: parsedDate,
                    source: ev.source,
                },
            });
            if (already) {
                continue; // skip si existant
            }
            // 5.3 Ouvrir la page détail pour récupérer description complète et fullImage
            let fullDescription = null;
            let fullImageUrl = null;
            try {
                const detailPage = await browser.newPage();
                await detailPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                await detailPage.setViewport({ width: 1280, height: 800 });
                await detailPage.goto(ev.link, {
                    waitUntil: "networkidle2",
                    timeout: 30000,
                });
                // 5.3.1 Description complète : tous les <p><span> sous .em-event-content
                try {
                    await detailPage.waitForSelector(".em-event-content", {
                        timeout: 10000,
                    });
                    const desc = await detailPage.evaluate(() => {
                        // On prend chaque <p><span> à l’intérieur de .em-event-content
                        const paras = Array.from(document.querySelectorAll(".em-event-content p span"));
                        return paras
                            .map((sp) => sp.textContent?.trim() || "")
                            .filter((txt) => txt.length > 0)
                            .join("\n\n");
                    });
                    fullDescription = desc || "";
                }
                catch {
                    console.warn(`ℹ️ Pas de ".em-event-content" trouvé pour "${ev.title}".`);
                }
                // 5.3.2 fullImage (la grande) : on cherche ".em-featured-image img" ou, à défaut, on retient le thumbnail
                try {
                    const imgURL = await detailPage.$eval(".em-item-image img", (img) => img.getAttribute("src") || "");
                    fullImageUrl = imgURL || null;
                }
                catch {
                    console.warn(`ℹ️ Pas d'image détail pour "${ev.title}", on gardera le thumbnail.`);
                }
                await detailPage.close();
            }
            catch (innerErr) {
                console.warn(`⚠️ Impossible d’ouvrir détail pour "${ev.title}" :`, innerErr);
            }
            // 5.4 On insère en base (Prisma)
            await db_1.prisma.event.create({
                data: {
                    title: ev.title,
                    category: ev.category || null,
                    description: fullDescription,
                    date: parsedDate,
                    time: ev.time || null,
                    location: ev.location || null,
                    link: ev.link,
                    image: fullImageUrl || ev.thumbnail || null,
                    price: null, // Cultures&P ne fournit pas explicitement de prix
                    priceCurrency: null,
                    source: ev.source,
                    type: ev.location ? "sur-place" : "en-ligne",
                },
            });
        }
        console.log(`✅ culturesetpatrimoines : ${basicEvents.length} événements traités`);
    }
    catch (error) {
        console.error("🚨 Erreur lors du scraping culturesetpatrimoines :", error);
    }
    finally {
        await browser.close();
    }
}
