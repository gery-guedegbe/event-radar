import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { supabase, prisma } from "../config/db";

import { createEventventSchema } from "../types/creatEventSchema";

export const eventRouter = express.Router();

type EventInput = z.input<typeof createEventventSchema>;
type EventOutput = z.output<typeof createEventventSchema>;

// Schéma de validation (Zod)
const EventSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Invalid date format",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:mm format",
  }),
  location: z.string().optional(),
  link: z.string().url().optional(),
  image: z.string().url().optional(),
  source: z.string().optional(),
});

eventRouter.get("/", (async (req: Request, res: Response) => {
  const { cursor, limit, search, category, status } = req.query;
  const now = new Date();
  const take = parseInt(limit as string, 10) || 12;

  // Construction des filtres communs
  let baseWhere: any = {};

  if (search) {
    baseWhere.OR = [
      { title: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (category) {
    baseWhere.category = category;
  }

  try {
    // Si un statut est précisé, on filtre normalement
    if (status === "upcoming" || status === "past") {
      const isUpcoming = status === "upcoming";
      const events = await prisma.event.findMany({
        where: {
          ...baseWhere,
          date: isUpcoming ? { gte: now } : { lt: now },
        },
        orderBy: {
          date: isUpcoming ? "asc" : "desc",
        },
        ...(cursor && {
          skip: 1,
          cursor: {
            id: cursor as string,
          },
        }),
        take,
      });

      return res.json({
        data: events,
        pagination: {
          hasMore: events.length === take,
          cursor: events.length > 0 ? events[events.length - 1].id : null,
        },
      });
    }

    // Sinon (status all ou absent), on combine upcoming + past
    const [upcomingEvents, pastEvents] = await Promise.all([
      prisma.event.findMany({
        where: {
          ...baseWhere,
          date: { gte: now },
        },
        orderBy: { date: "asc" },
      }),
      prisma.event.findMany({
        where: {
          ...baseWhere,
          date: { lt: now },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const allEvents = [...upcomingEvents, ...pastEvents];

    // Pagination manuelle si nécessaire
    let startIndex = 0;
    if (cursor) {
      const index = allEvents.findIndex((event) => event.id === cursor);
      startIndex = index >= 0 ? index + 1 : 0;
    }

    const paginated = allEvents.slice(startIndex, startIndex + take);

    res.json({
      data: paginated,
      pagination: {
        hasMore: startIndex + take < allEvents.length,
        cursor:
          paginated.length > 0 ? paginated[paginated.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}) as RequestHandler);

// 2. GET /api/events/:id - Récupérer un événement spécifique
eventRouter.get("/:id", async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST /api/events - Créer un nouvel événement
eventRouter.post(
  "/create-event",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const rawData = req.body as EventInput;
      const validated = createEventventSchema.parse(rawData);

      // Fusionne date et heure de début pour un vrai timestamp
      let eventDate = new Date(validated.date);

      if (validated.timeStart) {
        const [hours, minutes] = validated.timeStart.split(":");

        eventDate.setHours(Number(hours), Number(minutes), 0, 0);
      }

      console.log("Requête reçue - Body:", req.body);

      // Format des heures : "19h - 20h"
      let formattedTimeRange = "";

      if (validated.timeStart && validated.timeEnd) {
        const [hStart] = validated.timeStart.split(":");
        const [hEnd] = validated.timeEnd.split(":");
        formattedTimeRange = `${hStart}h - ${hEnd}h`;
      }

      // Correction : forcer image à string ou null
      const imageUrl =
        typeof validated.image === "string" ? validated.image : null;

      const newEvent = await prisma.event.create({
        data: {
          title: validated.title,
          category: validated.category,
          description: validated.description?.trim() || null,
          date: eventDate,
          time: formattedTimeRange || validated.timeStart || null,
          location: validated.location?.trim() || null,
          link: validated.link,
          image: imageUrl,
          source: validated.source || "manual",
          price: validated.price?.trim() || null,
          priceCurrency: validated.priceCurrency?.trim() || null,
          type: validated.type,
        },
      });

      await supabase.channel("events").send({
        type: "broadcast",
        event: "new-event",
        payload: newEvent,
      });

      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      console.error("Erreur lors de la création d'événement:", error);
      return res
        .status(500)
        .json({ error: "Échec de la création de l'événement" });
    }
  }
);

// 3. DELETE /api/events/:id - Supprimer un événement
eventRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Optionnel : Supprimer l'image associée si elle existe
    const event = await prisma.event.findUnique({ where: { id } });
    if (event?.image) {
      const fileName = event.image.split("/").pop();
      await supabase.storage.from("event-images").remove([fileName!]);
    }

    const deleted = await prisma.event.delete({ where: { id } });
    res.json(deleted);
  } catch (error) {
    res.status(404).json({ error: "Event not found" });
  }
});

// 4. DELETE /api/events/cleanup - Nettoyage automatique (> 30 jours)
eventRouter.delete("/cleanup", async (req: Request, res: Response) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Supprime les images du stockage en premier
    const oldEvents = await prisma.event.findMany({
      where: { date: { lt: cutoff } },
      select: { image: true },
    });

    const filesToDelete = oldEvents
      .filter((e) => e.image)
      .map((e) => e.image!.split("/").pop()!);

    if (filesToDelete.length > 0) {
      await supabase.storage.from("event-images").remove(filesToDelete);
    }

    // Supprime les entrées en base
    const result = await prisma.event.deleteMany({
      where: { date: { lt: cutoff } },
    });

    res.json({ deletedCount: result.count });
  } catch (error) {
    res.status(500).json({ error: "Cleanup failed" });
  }
});
