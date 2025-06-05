"use client";

import Link from "next/link";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import ShareButtons from "./ShareButtons";
import { Event } from "../types/event";
import { FC } from "react";

interface Props {
  event: Event;
}

const EventCard: FC<Props> = ({ event }) => {
  const eventDate = new Date(event.date);
  const now = new Date();
  const isUpcoming = eventDate.getTime() > now.getTime();

  console.log("Event", event);

  return (
    <div className="">
      {event.image && (
        <div className="relative h-48 w-full">
          <Image
            src={event.image}
            alt={event.title || "Image de l'événement"}
            fill
            className="object-cover transition hover:opacity-90"
            priority={false}
          />
        </div>
      )}

      <div className="space-y-2 p-4">
        <h2 className="text-xl leading-tight font-semibold text-white">
          <Link href={`/events/${event.id}`} className="hover:text-green-400">
            {event.title}
          </Link>
        </h2>

        <p className="text-sm text-gray-400">
          {eventDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {event.category && (
          <span className="inline-block rounded bg-green-500 px-2 py-1 text-xs text-white">
            {event.category}
          </span>
        )}

        {isUpcoming ? (
          <CountdownTimer targetDate={eventDate} />
        ) : (
          <span className="text-sm text-gray-500">Événement passé</span>
        )}

        <div className="mt-3 flex items-center justify-between">
          <ShareButtons
            url={window?.location.origin + `/events/${event.id}`}
            title={event.title}
          />

          <Link
            href={`/events/${event.id}`}
            className="text-sm font-medium text-green-400 hover:text-green-300"
          >
            Voir détails →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
