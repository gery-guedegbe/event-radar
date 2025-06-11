"use client";

import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Changer le thème"
      className="group border-light-border bg-light-card text-light-text hover:border-light-primary dark:border-dark-warning dark:bg-dark-card dark:hover:border-dark-warning flex cursor-pointer items-center justify-center rounded-full border p-2 shadow transition-all duration-200 outline-none hover:scale-105"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-400 transition duration-300 group-hover:rotate-90 lg:h-5 lg:w-5" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600 transition duration-300 group-hover:rotate-90 lg:h-5 lg:w-5" />
      )}
    </button>
  );
}
