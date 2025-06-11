"use client";

import { useEffect, useState } from "react";
import { Event } from "@/types/event";

interface FiltersProps {
  category: string | undefined;
  onCategoryChange: (category: string) => void;
  status: "all" | "upcoming" | "past" | undefined;
  onStatusChange: (status: "all" | "upcoming" | "past") => void;
  events: Event[];
}

export default function Filters({
  category,
  onCategoryChange,
  status,
  onStatusChange,
  events,
}: FiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(events.map((event) => event.category).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b)); // tri alphabétique
    setCategories(uniqueCategories);
  }, [events]);

  const statusOptions = [
    { label: "Tous", value: "all" },
    { label: "À venir", value: "upcoming" },
    { label: "Passés", value: "past" },
  ];

  return (
    <div className="flex w-full items-center gap-4">
      {/* Filtre Catégorie */}

      <select
        value={category || ""}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border-light-border dark:border-dark-border dark:bg-dark-background dark:text-dark-text focus:border-light-primary focus:ring-light-primary dark:focus:ring-dark-primary dark:focus:border-dark-primary w-1/2 rounded-md border bg-white px-3 py-3 text-sm shadow-sm focus:ring-1 focus:outline-none lg:py-2"
      >
        <option value="">Toutes catégories</option>

        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Filtre Statut */}

      <select
        value={status || "all"}
        onChange={(e) =>
          onStatusChange(e.target.value as "all" | "upcoming" | "past")
        }
        className="border-light-border dark:border-dark-border dark:bg-dark-background dark:text-dark-text focus:border-light-primary dark:focus:border-dark-primary focus:ring-light-primary dark:focus:ring-dark-primary dasr w-1/2 rounded-md border bg-white px-3 py-3 text-sm shadow-sm focus:ring-1 focus:outline-none lg:py-2"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
