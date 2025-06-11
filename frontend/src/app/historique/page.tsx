"use client";

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
  image: string;
  price?: string;
  priceCurrency?: string;
  source: string;
  type: "surplace" | "enligne";
}

import ShareModal from "@/components/ShareModal";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoriquePage() {
  const [events, setEvents] = useState<Event[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    setEvents(storedEvents);
  }, []);

  return (
    <div className="w-full pb-4 lg:pb-6">
      <h2 className="text-light-heading dark:text-dark-heading mb-6 text-xl font-bold md:text-2xl">
        Historique des événements
      </h2>

      {events.length === 0 ? (
        <p className="text-light-text dark:text-dark-text mt-4 text-center text-sm lg:text-base">
          Aucun événement enregistré.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event, index) => {
            const eventDate = new Date(event.date);
            const now = new Date();
            const isUpcoming = eventDate.getTime() > now.getTime();

            return (
              <div
                key={index}
                className="bg-light-background dark:bg-dark-background dark:border-dark-border max-w-xs overflow-hidden rounded-lg border border-black/20 shadow"
              >
                {event.image && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.image}
                      alt={event.title || "Image de l'événement"}
                      fill
                      className="object-cover transition hover:opacity-90"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                    />
                  </div>
                )}

                <div className="space-y-2.5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    {event.category && (
                      <span className="bg-light-primary/80 dark:bg-dark-primary/80 text-dark-heading inline-block max-w-[130px] truncate rounded-full p-1.5 text-xs">
                        {event.category}
                      </span>
                    )}

                    {isUpcoming ? (
                      <span className="bg-light-success/20 text-light-success dark:bg-dark-success dark:text-dark-text rounded-full p-1.5 text-xs">
                        À venir
                      </span>
                    ) : (
                      <span className="bg-light-subtext/20 text-light-subtext dark:bg-dark-subtext/20 dark:text-dark-subtext rounded-full p-1.5 text-xs">
                        Événement passé
                      </span>
                    )}
                  </div>

                  <h2 className="text-dark-foreground dark:text-light-foreground text-lg leading-tight font-semibold lg:text-xl">
                    <Link href={`/events/${event.id}`} className="">
                      {event.title}
                    </Link>
                  </h2>

                  {event.date && (
                    <div className="text-light-text dark:text-dark-text flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />

                      <p className="">
                        {eventDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {event.location && (
                    <div className="text-light-text dark:text-dark-text flex items-center text-sm">
                      <MapPin className="mr-1 h-4 w-4" />

                      <p className="">{event.location}</p>
                    </div>
                  )}

                  <div className="mt-3 flex w-full items-center justify-between gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="bg-light-primary/80 hover:bg-light-primary/90 dark:bg-dark-primary/80 text-dark-heading flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      Voir détails
                    </Link>

                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="border-light-subtext text-light-text dark:text-dark-text dark:border-dark-border cursor-pointer rounded-lg border bg-white p-2.5 text-sm outline-none hover:opacity-70 dark:bg-transparent"
                    >
                      <ExternalLink className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5" />
                    </button>
                  </div>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                  <ShareModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    event={event}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
