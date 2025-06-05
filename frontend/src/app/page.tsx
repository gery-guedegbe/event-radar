"use client";

import { useState } from "react";
import { useInfiniteEvents } from "../hooks/useInfiniteEvents";
import EventCard from "../components/EventCard";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import { EventFilter } from "../types/event";

export default function Home() {
  // **1) État des filtres / Recherche**
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<"all" | "upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(false);

  const filters: EventFilter = { search, category, status };

  // **2) Hook infiniteQuery**
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteEvents({ limit: 10, filters });

  // Concaténer toutes les pages
  const allEvents = data?.pages.flatMap((page) => page.items || []) || [];

  // **3) Déclencher le chargement supplémentaire au scroll**
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      setIsLoading(true);
      await fetchNextPage();
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Recherche + Filtres */}
        <div className="sticky top-10 mb-6 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <SearchBar value={search} onChange={setSearch} />

          <Filters
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
          />
        </div>

        {/* Liste (infinite scroll) */}
        <div
          className="grid grid-cols-1 gap-6 overflow-auto sm:grid-cols-2 lg:grid-cols-3"
          onScroll={handleScroll}
        >
          {allEvents.length > 0 ? (
            allEvents.map((evt) => <EventCard key={evt.id} event={evt} />)
          ) : (
            <div className="col-span-full py-4 text-center">
              Aucun événement trouvé
            </div>
          )}

          {isFetchingNextPage && (
            <div className="col-span-full py-4 text-center">Chargement...</div>
          )}
          {!hasNextPage && (
            <div className="col-span-full py-4 text-center text-gray-400">
              Plus d’événements à afficher
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-red-500">Erreur : {error.message}</p>}
      </div>
    </div>
  );
}
