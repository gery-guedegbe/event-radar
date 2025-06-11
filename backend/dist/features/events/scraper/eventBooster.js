"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeEventBooster = scrapeEventBooster;
const puppeteer_1 = __importDefault(require("puppeteer"));
const db_1 = require("../../../config/db");
async function scrapeEventBooster() {
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
        // 1) Aller sur la page principale des événements
        await page.goto("https://www.events-booster.com/index.php/events/", {
            waitUntil: "networkidle2",
            timeout: 30000,
        });
        // 2) Attendre que le conteneur des listes soit présent
        try {
            await page.waitForSelector(".mec-event-list-standard", {
                timeout: 15000,
            });
        }
        catch {
            console.warn("⚠️ .mec-event-list-standard non trouvé après 15 s.");
        }
        // 3) Récupérer tous les JSON-LD <script> sous .mec-event-list-standard,
        //    pour en extraire un maximum d’informations de base (title, description, date, image, lien).
        const basicEvents = await page.evaluate(() => {
            const results = [];
            const scripts = document.querySelectorAll(".mec-event-list-standard script[type='application/ld+json']");
            scripts.forEach((script) => {
                try {
                    const data = JSON.parse(script.textContent || "{}");
                    if (data["@type"] !== "Event")
                        return;
                    const title = data.name || "";
                    const description = data.description;
                    const startDateString = data.startDate || "";
                    const endDateString = data.endDate;
                    const link = data.url || "";
                    const image = data.image;
                    results.push({
                        title,
                        description,
                        date: startDateString,
                        endDate: endDateString,
                        link,
                        image,
                        source: "events-booster",
                    });
                }
                catch {
                    // JSON invalide → on passe
                }
            });
            return results;
        });
        if (basicEvents.length === 0) {
            console.warn("⚠️ Aucun événement JSON-LD extrait sur events-booster");
        }
        // 4) Pour chaque “basic event”, on ouvre sa page détail et on récupère les infos manquantes :
        for (const ev of basicEvents) {
            // 4.1 Transformer `ev.date` en Date JS
            const parsedDate = new Date(ev.date);
            if (isNaN(parsedDate.getTime())) {
                console.warn(`Date invalide pour "${ev.title}": ${ev.date}`);
                continue;
            }
            // 4.2 Vérifier s’il existe déjà (title + date + source)
            const exists = await db_1.prisma.event.findFirst({
                where: {
                    title: ev.title,
                    date: parsedDate,
                    source: ev.source,
                },
            });
            if (exists) {
                continue; // déjà en base
            }
            // 4.3 Ouvrir la page détail pour récupérer time, location, category, price, type
            let detailTime = null;
            let detailLocation = null;
            let detailCategory = null;
            let detailPrice = null;
            let detailPriceCurrency = null;
            let detailType = "sur-place"; // par défaut “sur-place” (on ajustera à “en-ligne” si pas de lieu)
            try {
                const detailPage = await browser.newPage();
                await detailPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
                await detailPage.setViewport({ width: 1280, height: 800 });
                await detailPage.goto(ev.link, {
                    waitUntil: "networkidle2",
                    timeout: 30000,
                });
                // 4.3.1 Attendre le conteneur “mec-event-info-desktop”
                await detailPage.waitForSelector(".mec-event-info-desktop", {
                    timeout: 10000,
                });
                // Dans la page détail, on récupère :
                const detailData = await detailPage.evaluate(() => {
                    // Helper pour récupérer `textContent` nettoyé
                    function txt(sel) {
                        const el = document.querySelector(sel);
                        return el?.textContent?.trim() ?? null;
                    }
                    // -- Heure : <div class="mec-single-event-time">…<dd><abbr>20h00</abbr></dd>…</div>
                    const timeEl = document.querySelector(".mec-single-event-time dl dd abbr");
                    const time = timeEl?.textContent?.trim() ?? null;
                    // -- Lieu : <div class="mec-single-event-location">…<dd class="author fn org">Jardin…</dd>…</div>
                    const locationEl = document.querySelector(".mec-single-event-location dl dd.author.fn.org");
                    const location = locationEl?.textContent?.trim() ?? null;
                    // -- Catégories : `<div class="mec-single-event-category">…<a>Bars & Clubs</a><a>Concerts & Danses</a>…</div>`
                    const catNodes = Array.from(document.querySelectorAll(".mec-single-event-category dl dd.mec-events-event-categories a"));
                    const categories = catNodes
                        .map((a) => a.textContent?.trim() ?? "")
                        .filter((s) => s.length > 0);
                    const category = categories.length > 0 ? categories.join(" & ") : null;
                    // -- Prix (s’il existe) dans un éventuel `<div class="mec-single-event-price">`
                    let price = null;
                    let priceCurrency = null;
                    const priceEl = document.querySelector(".mec-single-event-price dl dd");
                    if (priceEl) {
                        // On suppose “XOF 599” par exemple, ou “599 XOF”
                        const raw = priceEl.textContent?.trim() ?? "";
                        const parts = raw.split(" ");
                        // si “XOF” présent en 1er mot → currency = parts[0], price = parts[1]
                        if (parts.length >= 2 && /^[0-9]/.test(parts[1])) {
                            priceCurrency = parts[0];
                            price = parts[1];
                        }
                        else if (parts.length >= 2 && /^[0-9]/.test(parts[0])) {
                            price = parts[0];
                            priceCurrency = parts[1];
                        }
                        else {
                            // cas fallback : on prend l’intégralité dans `price`
                            price = raw;
                        }
                    }
                    return { time, location, category, price, priceCurrency };
                });
                detailTime = detailData.time;
                detailLocation = detailData.location;
                detailCategory = detailData.category;
                detailPrice = detailData.price;
                detailPriceCurrency = detailData.priceCurrency;
                // 4.3.2 Déterminer le type en-ligne / sur-place
                //     Si `location` est non null et non vide → "sur-place",
                //     sinon “en-ligne”
                detailType = detailLocation ? "sur-place" : "en-ligne";
                await detailPage.close();
            }
            catch (innerErr) {
                console.warn(`⚠️ Impossible d’extraire détail pour "${ev.title}":`, innerErr);
            }
            // 4.4 Insérer en base (Prisma)
            await db_1.prisma.event.create({
                data: {
                    type: detailType,
                    title: ev.title,
                    category: detailCategory || null,
                    description: ev.description || null,
                    date: parsedDate,
                    time: detailTime || null,
                    location: detailLocation || null,
                    link: ev.link,
                    image: ev.image || null,
                    price: detailPrice || null,
                    priceCurrency: detailPriceCurrency || null,
                    source: ev.source,
                },
            });
        }
        console.log(`✅ events-booster : ${basicEvents.length} événements traités`);
    }
    catch (error) {
        console.error("🚨 Erreur lors du scraping events-booster :", error);
    }
    finally {
        await browser.close();
    }
}
