"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";

import Image from "next/image";

import { createEvent, uploadImage } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  status: "upcoming" | "past";
  description?: string;
  timeStart: string;
  timeEnd: string;
  location?: string;
  link: string;
  image?: File | string;
  price?: string;
  priceCurrency?: string;
  source: string;
  type: "surplace" | "enligne";
}

export default function AddEventPage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formik = useFormik<Omit<Event, "id">>({
    initialValues: {
      title: "",
      date: "",
      category: "",
      status: "upcoming",
      description: "",
      timeStart: "",
      timeEnd: "",
      location: "",
      link: "",
      image: "",
      price: "",
      priceCurrency: "",
      source: "manual",
      type: "surplace",
    },

    validationSchema: Yup.object({
      title: Yup.string().required("Titre obligatoire"),
      date: Yup.string().required("Date obligatoire"),
      category: Yup.string().required("Catégorie requise"),
      description: Yup.string().required("Description requise"),
      timeStart: Yup.string()
        .required("L'heure de départ est requise")
        .test("is-time", "Format d'heure invalide (HH:MM)", (value) => {
          if (!value) return false;
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        }),

      timeEnd: Yup.string()
        .required("L'heure de fin est requise")
        .test("is-time", "Format d'heure invalide (HH:MM)", (value) => {
          if (!value) return false;
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        }),

      location: Yup.string().required("Lieu requis"),
      link: Yup.string().url("Lien invalide"),
      image: Yup.mixed()
        .test("is-image", "Image requise", (value) => !!value)
        .test(
          "is-image-url-or-file",
          "Image invalide",
          (value) => typeof value === "string" || value instanceof File,
        ),
      price: Yup.string(),
      priceCurrency: Yup.string(),
      type: Yup.string().required("Type d'événement requis"),
    }),

    onSubmit: async (values) => {
      setSubmitError(null);
      setIsLoading(true);
      setSuccessMessage(null);

      const errors = await formik.validateForm();

      if (Object.keys(errors).length > 0) {
        console.warn("Erreurs de validation : ", errors);
        setSubmitError("Formulaire invalide");
        setIsLoading(false);
        return;
      }

      try {
        // Préparation des données
        let imageUrl = values.image;

        if (values.image instanceof File) {
          imageUrl = await uploadImage(values.image as File);
        }

        // Construction explicite du payload sans l'id
        const payload = {
          title: values.title,
          date: new Date(values.date).toISOString(),
          category: values.category,
          status: values.status,
          description: values.description,
          timeStart: values.timeStart,
          timeEnd: values.timeEnd,
          location: values.location,
          link: values.link,
          image: imageUrl || "",
          price: values.price,
          priceCurrency: values.priceCurrency,
          source: values.source,
          type: values.type,
        };

        // On récupère l'event créé avec l'id de la base
        const createdEvent = await createEvent(payload);

        const existingEvents = JSON.parse(
          localStorage.getItem("events") || "[]",
        );

        // On stocke l'event retourné par le backend (avec le bon id)
        localStorage.setItem(
          "events",
          JSON.stringify([...existingEvents, createdEvent]),
        );

        setSuccessMessage("Événement créé avec succès ! Redirection...");
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } catch (error) {
        setIsLoading(false);
        console.error("Erreur:", error);
        setSubmitError(
          (error as Error).message || "Erreur lors de la création",
        );
      }
    },
  });

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  return (
    <div className="mx-auto max-w-3xl pb-4 lg:pb-8">
      <h2 className="text-light-heading dark:text-dark-heading mb-6 text-xl font-bold md:text-2xl">
        Ajouter un événement
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {isLoading && (
          <div className="bg-light-heading/20 dark:bg-dark-heading/20 fixed inset-0 z-20 flex h-screen w-full flex-col items-center justify-center gap-2 overflow-hidden">
            <LoadingSpinner />

            <span className="text-light-primary dark:text-dark-primary text-sm font-medium lg:text-base">
              Création de l&apos;événement en cours...
            </span>
          </div>
        )}

        {successMessage && (
          <div className="bg-light-success/20 dark:bg-dark-success/20 text-light-success dark:text-dark-success fixed inset-0 mb-4 flex h-screen w-full items-center justify-center overflow-hidden rounded px-4 py-2 text-sm font-medium lg:text-base">
            {successMessage}
          </div>
        )}

        {submitError && (
          <div className="bg-light-error/20 dark:bg-dark-error/20 text-light-error dark:text-dark-error fixed inset-0 mb-4 flex h-screen w-full items-center justify-center overflow-hidden rounded px-4 py-2 text-sm font-medium lg:text-base">
            {submitError}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Titre *
          </label>

          <input
            type="text"
            name="title"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.title}
            placeholder="Titre de l'événement"
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
          />

          {formik.touched.title && formik.errors.title && (
            <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
              {formik.errors.title}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-3">
          {/* Time */}
          <div className="w-full lg:w-1/2">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Heure de demarrage
            </label>

            <input
              type="time"
              name="timeStart"
              onChange={formik.handleChange}
              value={formik.values.timeStart || ""}
              placeholder="Heure de début (ex: 09:00)"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />

            {formik.touched.timeStart && formik.errors.timeStart && (
              <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
                {formik.errors.timeStart}
              </p>
            )}
          </div>

          {/* End date */}
          <div className="w-full lg:w-1/2">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Heure de fin
            </label>

            <input
              type="time"
              name="timeEnd"
              onChange={formik.handleChange}
              value={formik.values.timeEnd || ""}
              placeholder="Heure de fin (ex: 18:00)"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />

            {formik.touched.timeEnd && formik.errors.timeEnd && (
              <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
                {formik.errors.timeEnd}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-3">
          {/* Date */}
          <div className="w-full lg:w-1/2">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Date *
            </label>

            <input
              type="date"
              name="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
              placeholder="Date de l'événement"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />

            {formik.touched.date && formik.errors.date && (
              <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
                {formik.errors.date}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="w-full lg:w-1/2">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Catégorie *
            </label>

            <input
              type="text"
              name="category"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.category}
              placeholder="Catégorie (ex: Tech, Art, Sport, Conférence...)"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />

            {formik.touched.category && formik.errors.category && (
              <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
                {formik.errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Description
          </label>

          <textarea
            name="description"
            onChange={formik.handleChange}
            value={formik.values.description || ""}
            placeholder="Description de l'événement"
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            rows={5}
          />

          {formik.touched.description && formik.errors.description && (
            <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
              {formik.errors.description}
            </p>
          )}
        </div>

        {/* Lieu */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Lieu
          </label>

          <input
            type="text"
            name="location"
            onChange={formik.handleChange}
            value={formik.values.location || ""}
            placeholder="Lieu (ex: Cotonou, En ligne...)"
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
          />

          {formik.touched.location && formik.errors.location && (
            <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
              {formik.errors.location}
            </p>
          )}
        </div>

        {/* Lien */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Lien vers l&apos;événement *
          </label>

          <input
            type="url"
            name="link"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.link}
            placeholder="Lien vers l'événement (ex: https://...)"
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreviewImage(URL.createObjectURL(file));
                formik.setFieldValue("image", file);
              } else {
                setPreviewImage(null);
                formik.setFieldValue("image", null);
              }
            }}
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            placeholder="Image de l'événement"
          />

          {previewImage ? (
            <div className="mt-3">
              <Image
                src={previewImage}
                alt="Aperçu"
                width={200}
                height={150}
                className="rounded shadow"
              />
            </div>
          ) : formik.values.image && typeof formik.values.image === "string" ? (
            <div className="mt-3">
              <p className="text-light-heading dark:text-dark-heading text-sm font-medium">
                Image existante:
              </p>

              <Image
                src={formik.values.image}
                alt="Image existante"
                width={200}
                height={150}
                className="rounded shadow"
              />
            </div>
          ) : null}

          {formik.touched.image && formik.errors.image && (
            <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
              {formik.errors.image}
            </p>
          )}
        </div>

        {/* Prix */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Prix
            </label>

            <input
              type="text"
              name="price"
              onChange={formik.handleChange}
              value={formik.values.price || ""}
              placeholder="Prix (ex: 5000)"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />
          </div>

          <div className="flex-1">
            <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
              Devise
            </label>

            <input
              type="text"
              name="priceCurrency"
              onChange={formik.handleChange}
              value={formik.values.priceCurrency || ""}
              placeholder="Devise (ex: XOF, EUR, USD)"
              className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
            />
          </div>
        </div>

        {/* Type d'événement */}
        <div>
          <label className="text-light-heading dark:text-dark-heading block text-sm font-medium lg:text-base">
            Type d&apos;événement *
          </label>

          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            className="dark:border-dark-border dark:bg-dark-background text-light-text dark:text-dark-text mt-1 w-full rounded border border-black/30 bg-white p-2 text-sm outline-none lg:mt-1.5 lg:text-base"
          >
            <option value="surplace">Sur place</option>
            <option value="enligne">En ligne</option>
          </select>

          {formik.touched.type && formik.errors.type && (
            <p className="text-light-error dark:text-dark-error mt-1.5 text-sm">
              {formik.errors.type}
            </p>
          )}
        </div>

        {/* Bouton submit */}
        <div className="">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="bg-light-primary dark:bg-dark-primary text-light-foreground dark:text-dark-heading w-full cursor-pointer rounded px-6 py-2 text-sm font-semibold transition-all hover:opacity-90 lg:w-fit lg:text-base"
          >
            Ajouter l&apos;événement
          </button>
        </div>
      </form>
    </div>
  );
}
