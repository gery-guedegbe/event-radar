"use client";

import React from "react";

interface FiltersProps {
  category: string;
  onCategoryChange: (category: string) => void;
  status: "all" | "upcoming" | "past";
  onStatusChange: (status: "all" | "upcoming" | "past") => void;
}

const categoryOptions = ["Tous", "Tech", "Business", "Culture", "Éducation"];
const statusOptions: { label: string; value: "all" | "upcoming" | "past" }[] = [
  { label: "Tous", value: "all" },
  { label: "À venir", value: "upcoming" },
  { label: "Passés", value: "past" },
];

export default function Filters({
  category,
  onCategoryChange,
  status,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Catégorie */}
      <div>
        <label className="mr-2 font-medium">Catégorie :</label>
        <select
          value={category}
          onChange={(e) =>
            onCategoryChange(e.target.value === "Tous" ? "" : e.target.value)
          }
          className="rounded bg-gray-800 px-3 py-2 text-white"
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Statut */}
      <div>
        <label className="mr-2 font-medium">Statut :</label>
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as "all" | "upcoming" | "past")
          }
          className="rounded bg-gray-800 px-3 py-2 text-white"
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
