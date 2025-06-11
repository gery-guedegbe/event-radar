import puppeteer from "puppeteer";
import { prisma } from "../../../config/db";

interface ScrapedEvent {
  title: string;
  category: string;
  date: string;
  time: string;
  location?: string;
  link?: string;
  image?: string;
  fullImage?: string;
  description?: string;
  source: string;
}

export async function scrapeIFBenin() {
  // 1. Lancer le navigateur en headless “new”
  const browser = await puppeteer.launch({
    // @ts-ignore
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });

    // 2. Aller sur la page et attendre qu’elle soit stable
    await page.goto("https://if-benin.com/agenda-culturel/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 3. Attendre la présence d’au moins un événement
    try {
      await page.waitForSelector(".events-list .event-item", {
        timeout: 15000,
      });
    } catch {
      console.warn(
        "⚠️ .event-item non trouvé après 15 s — on continue quand même"
      );
    }

    // 4. Extraire la liste sommaire d’événements
    const scraped: ScrapedEvent[] = await page.evaluate(() => {
      const events: ScrapedEvent[] = [];

      document.querySelectorAll(".events-list .event-item").forEach((el) => {
        // miniature (150×150)
        const thumbnail =
          el
            .querySelector(".event-item-image img")
            ?.getAttribute("src")
            ?.trim() || undefined;

        // titre
        const title = el.querySelector(".ev-title")?.textContent?.trim() || "";

        // catégorie
        const category =
          el.querySelector(".ev-category span")?.textContent?.trim() || "";

        // date (ex. "05/06/2025")
        const date =
          el.querySelector(".ev-date span")?.textContent?.trim() || "";

        // heure (ex. "18h00")
        const time =
          el.querySelector(".ev-hour span")?.textContent?.trim() || "";

        // lien vers la page détail
        const link =
          el.querySelector(".ev-link a")?.getAttribute("href") || undefined;

        if (title && date && time) {
          events.push({
            title,
            category,
            date,
            time,
            link,
            image: thumbnail,
            source: "if-benin",
          });
        }
      });

      return events;
    });

    if (scraped.length === 0) {
      console.warn("⚠️ Aucun événement extrait : vérifier les sélecteurs CSS");
    }

    // 5. Parcourir chaque événement extrait
    for (const e of scraped) {
      // 5.1 Convertir “dd/MM/yyyy” en année, mois, jour
      const [dayStr, monthStr, yearStr] = e.date.split("/");
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);

      if (
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12
      ) {
        console.warn(`Date invalide pour "${e.title}" : ${e.date}`);
        continue;
      }

      // 5.2 Convertir “18h00” → “18:00”
      const timeNormalized = e.time.replace("h", ":"); // ex. "18:00"
      const [hourStr, minuteStr] = timeNormalized.split(":");
      const hour = Number(hourStr);
      const minute = Number(minuteStr);

      if (
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        console.warn(`Heure invalide pour "${e.title}" : ${e.time}`);
        continue;
      }

      // 5.3 Composer la date ISO complète “YYYY-MM-DDTHH:mm:00”
      const isoString = `${yearStr.padStart(4, "0")}-${monthStr.padStart(
        2,
        "0"
      )}-${dayStr.padStart(2, "0")}T${hourStr.padStart(2, "0")}:${minuteStr.padStart(
        2,
        "0"
      )}:00`;
      const parsedDate = new Date(isoString);

      if (isNaN(parsedDate.getTime())) {
        console.warn(
          `Impossible de parser la date pour "${e.title}" : ${isoString}`
        );
        continue;
      }

      // 5.4 Vérifier dans Prisma si l’événement existe déjà
      const exists = await prisma.event.findFirst({
        where: {
          title: e.title,
          date: parsedDate,
          source: e.source,
        },
      });
      if (exists) {
        // Si déjà en base, on passe au suivant (pas de duplication)
        continue;
      }

      // 5.5 Récupérer la description et la “fullImage” sur la page détail
      let description: string | undefined = undefined;
      let fullImage: string | undefined = undefined;

      if (e.link) {
        try {
          const detailPage = await browser.newPage();
          await detailPage.setViewport({ width: 1280, height: 800 });
          await detailPage.goto(e.link, {
            waitUntil: "networkidle2",
            timeout: 20000,
          });

          // 5.5.1 Extraire la description depuis ".post-content"
          try {
            await detailPage.waitForSelector(".post-content", {
              timeout: 10000,
            });
            description = await detailPage.$eval(
              ".post-content",
              (el) => el.textContent?.trim() || ""
            );
          } catch {
            console.warn(`⚠️ Pas de .post-content pour "${e.title}"`);
          }

          // 5.5.2 Extraire l’image grand format depuis ".featured-image img"
          try {
            await detailPage.waitForSelector(".featured-image img", {
              timeout: 5000,
            });
            fullImage = await detailPage.$eval(
              ".featured-image img",
              (img) => img.getAttribute("src") || undefined
            );
          } catch {
            console.warn(
              `ℹ️ Pas d'image grand format pour "${e.title}", on gardera la miniature`
            );
          }

          await detailPage.close();
        } catch (err) {
          console.warn(
            `⚠️ Impossible d’ouvrir la page détail pour "${e.title}" :`,
            err
          );
        }
      }

      // 5.6 Choisir la meilleure image à stocker
      const imageToStore = fullImage || e.image;

      // 5.7 Insérer en base
      await prisma.event.create({
        data: {
          title: e.title,
          category: e.category,
          description,
          date: parsedDate,
          time: e.time,
          location: undefined,
          link: e.link,
          image: imageToStore,
          source: e.source,
        },
      });
    }

    console.log(`✅ if-benin : ${scraped.length} événements traités`);
  } catch (error) {
    console.error("🚨 Erreur lors du scraping :", error);
  } finally {
    await browser.close();
  }
}
