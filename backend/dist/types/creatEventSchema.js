"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventventSchema = void 0;
const zod_1 = require("zod");
exports.createEventventSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est obligatoire"),
    category: zod_1.z.string().min(1, "La catégorie est requise"),
    description: zod_1.z.string().min(1, "La description est requise"),
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "La date est requise et doit être valide",
    }),
    timeStart: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "L'heure de début est requise et doit être au format HH:mm",
    }),
    timeEnd: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "L'heure de fin est requise et doit être au format HH:mm",
    }),
    location: zod_1.z.string().min(1, "Le lieu est requis"),
    link: zod_1.z.string().url("Lien invalide").min(1, "Le lien est requis"),
    image: zod_1.z
        .string()
        .url("L'URL de l'image est requise")
        .min(1, "L'image est requise"),
    price: zod_1.z.string().optional(),
    priceCurrency: zod_1.z.string().optional(),
    status: zod_1.z.enum(["upcoming", "past"]).optional().default("upcoming"),
    source: zod_1.z.string().default("manual"),
    type: zod_1.z.string().min(1, "Le type d'événement est requis"),
});
