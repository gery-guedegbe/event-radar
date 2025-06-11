"use client";

import { useEffect, useState } from "react";

import { PlusIcon, RadarIcon } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
  const [hasEvents, setHasEvents] = useState(false);

  useEffect(() => {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    setHasEvents(events.length > 0);
  }, []);

  return (
    <header className="dark:bg-dark-background/5 fixed top-0 right-0 left-0 z-20 mx-auto w-full max-w-[1600px] bg-white/5 px-2 py-4 backdrop-blur-2xl lg:px-8 lg:py-5">
      <nav className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center gap-1 lg:gap-1.5">
          <RadarIcon className="text-light-primary dark:text-dark-primary h-7 w-7 lg:h-8 lg:w-8" />

          <p className="text-light-heading dark:text-dark-heading text-xl font-medium lg:text-xl">
            EventRadar
          </p>
        </Link>

        <div className="flex items-center gap-3 lg:gap-6">
          {hasEvents && (
            <Link
              href="/historique"
              className="text-light-primary dark:text-dark-primary text-sm font-medium lg:text-base"
            >
              Historique
            </Link>
          )}

          <div className="flex items-center gap-2.5 lg:gap-4">
            <Link
              href="/create-event"
              className="bg-light-primary dark:bg-dark-primary text-light-foreground dark:text-dark-heading flex items-center justify-center gap-1 rounded-lg px-2 py-2 lg:gap-1.5 lg:rounded-xl lg:px-3 lg:py-2"
            >
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5" />

              <span className="hidden lg:block">Ajouter un événement</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
