"use client";

import { useCallback, useRef, useState } from "react";
import { useInfiniteEvents } from "../hooks/useInfiniteEvents";
import EventCard from "../components/EventCard";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import { EventFilter } from "../types/event";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const [filters, setFilters] = useState<EventFilter>({
    search: "",
    category: "",
    status: "all",
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteEvents({
    limit: 12,
    filters,
  });

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const handleStatusChange = useCallback(
    (status: "all" | "upcoming" | "past") => {
      setFilters((prev) => ({ ...prev, status }));
    },
    [],
  );

  const observer = useRef<IntersectionObserver | null>(null);

  const lastEventRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 },
      );

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const allEvents = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="flex min-h-screen w-full flex-col space-y-6 lg:space-y-8">
      <div className="my-8 flex flex-col items-center gap-3 text-center lg:mb-10 lg:gap-4">
        <h1 className="text-light-heading dark:text-dark-heading text-4xl font-bold md:text-5xl">
          Découvrez des Événements Incroyables
        </h1>

        <p className="text-light-text dark:text-dark-text max-w-2xl text-xl">
          Trouvez et explorez les meilleurs événements qui se déroulent autour
          de vous. Des conférences tech aux ateliers créatifs.
        </p>
      </div>

      <div className="w-full">
        {/* Barre de recherche et filtres */}
        <div className="mx-auto mb-8 flex w-full max-w-3xl flex-col items-center justify-between space-y-4 lg:mb-12">
          <SearchBar
            value={filters.search}
            onChange={handleSearch}
            placeholder="Rechercher des événements..."
          />

          <Filters
            category={filters.category}
            onCategoryChange={handleCategoryChange}
            status={filters.status}
            onStatusChange={handleStatusChange}
            events={allEvents}
          />
        </div>

        {/* Liste des événements */}
        {error ? (
          <div className="text-center text-red-500">
            Erreur: {error.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allEvents.map((event, index) => (
              <div
                ref={index === allEvents.length - 1 ? lastEventRef : null}
                key={`${event.id}-${index}`}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}

        {/* États de chargement */}
        {(isFetchingNextPage || isFetching) && (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!hasNextPage && allEvents.length > 0 && (
          <div className="text-light-text dark:text-dark-text mt-4 text-center text-sm lg:text-base">
            Vous avez atteint la fin de la liste
          </div>
        )}

        {!isFetching && allEvents.length === 0 && (
          <div className="text-light-text dark:text-dark-text mt-4 text-center text-sm lg:text-base">
            Aucun événement trouvé avec ces critères
          </div>
        )}
      </div>
    </div>
  );
}
