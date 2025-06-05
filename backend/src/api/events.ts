import express from "express";
import type { Request, Response, NextFunction } from "express";

import { supabase, prisma } from "../config/db";
import { z } from "zod";

export const eventRouter = express.Router();

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

// 1. GET /api/events - Liste des événements (≤ 30 jours)
eventRouter.get("/", async (req: Request, res: Response) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    const events = await prisma.event.findMany({
      where: { date: { gte: cutoff } },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

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

eventRouter.post(
  "/",
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const validated = EventSchema.parse(req.body);

      const newEvent = await prisma.event.create({
        data: {
          title: validated.title,
          category: validated.category,
          description: validated.description,
          date: new Date(validated.date),
          time: validated.time,
          location: validated.location,
          link: validated.link,
          image: validated.image,
          source: validated.source,
        },
      });

      // Notification temps réel (optionnel)
      await supabase.channel("events").send({
        type: "broadcast",
        event: "new-event",
        payload: newEvent,
      });

      res.status(201).json(newEvent);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
        return;
      }
      res.status(500).json({ error: "Failed to create event" });
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
