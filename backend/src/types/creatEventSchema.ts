import { z } from "zod";

export const createEventventSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().min(1, "La description est requise"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La date est requise et doit être valide",
  }),
  timeStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "L'heure de début est requise et doit être au format HH:mm",
  }),
  timeEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "L'heure de fin est requise et doit être au format HH:mm",
  }),
  location: z.string().min(1, "Le lieu est requis"),
  link: z.string().url("Lien invalide").min(1, "Le lien est requis"),
  image: z
    .string()
    .url("L'URL de l'image est requise")
    .min(1, "L'image est requise"),
  price: z.string().optional(),
  priceCurrency: z.string().optional(),
  status: z.enum(["upcoming", "past"]).optional().default("upcoming"),
  source: z.string().default("manual"),
  type: z.string().min(1, "Le type d'événement est requis"),
});
