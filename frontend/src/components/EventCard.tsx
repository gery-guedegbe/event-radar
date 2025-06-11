"use client";

import Link from "next/link";
import Image from "next/image";

import { FC, useState } from "react";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import ShareModal from "./ShareModal";
import type { Event } from "@/types/event";

interface Props {
  event: Event;
}

const EventCard: FC<Props> = ({ event }) => {
  const eventDate = new Date(event.date);
  const now = new Date();
  const isUpcoming = eventDate.getTime() > now.getTime();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-light-background dark:bg-dark-background dark:border-dark-border overflow-hidden rounded-lg border border-black/20 shadow">
      {event.image && typeof event.image === "string" && (
        <div className="relative h-48 w-full">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isUpcoming}
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
};

export default EventCard;
