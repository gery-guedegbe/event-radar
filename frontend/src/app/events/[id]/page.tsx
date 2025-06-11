import { fetchEventById } from "@/utils/api";
import { notFound } from "next/navigation";

import Image from "next/image";
import CountdownTimer from "../../../components/CountdownTimer";
import ShareButtons from "../../../components/ShareButtons";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ticket, TimerIcon } from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default async function EventDetailPage({ params }: Props) {
  // Extraction asynchrone de l'ID
  const id = await Promise.resolve(params.id);

  const event = await fetchEventById(id);

  if (!event) {
    return notFound();
  }

  const eventDate = new Date(event.date);
  const now = new Date();
  const isUpcoming = eventDate.getTime() > now.getTime();
  // Utilisation d'une URL statique plutôt que window
  const eventUrl = `${process.env.NEXT_PUBLIC_SITE}/events/${id}`;

  return (
    <div className="min-h-screen w-full pb-4 lg:pb-8">
      <Link
        href="/"
        className="text-light-heading dark:text-dark-heading mb-4 flex items-center gap-1.5 rounded-md text-sm outline-none lg:mb-6 lg:text-base"
      >
        <ArrowLeft className="h-3.5 w-3.5 lg:h-5 lg:w-5" /> Retour à la liste
      </Link>

      <div className="border-light-border dark:border-dark-border flex w-full flex-col gap-4 space-y-6 border shadow-none lg:flex-col lg:gap-6 lg:shadow">
        {event.image && typeof event.image === "string" && (
          <div className="bg-light-border dark:bg-dark-border relative h-[60vh] lg:h-[90vh]">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="h-full w-full rounded-lg object-contain"
              priority
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex w-full items-center gap-3 px-2 lg:px-4">
            {event.category && (
              <span className="bg-light-primary/80 dark:bg-dark-primary/80 text-dark-heading inline-block max-w-[130px] truncate rounded-full p-2 text-sm lg:text-base">
                {event.category}
              </span>
            )}

            {isUpcoming ? (
              // <CountdownTimer targetDate={eventDate} />
              <span className="bg-light-success/20 text-light-success dark:bg-dark-success/20 dark:text-dark-success rounded-full p-2 text-sm lg:text-base">
                À venir
              </span>
            ) : (
              <span className="bg-light-subtext/20 text-light-subtext dark:bg-dark-subtext/20 dark:text-dark-subtext rounded-full p-2 text-sm lg:text-base">
                Événement passé
              </span>
            )}
          </div>

          <h1 className="text-light-heading dark:text-dark-heading px-2 text-xl font-bold lg:px-4 lg:text-4xl">
            {event.title}
          </h1>

          <div className="bg-light-border dark:bg-dark-border bg h-[1px] w-full" />

          <div className="flex w-full flex-col items-start gap-4 px-2 pb-4 lg:flex-row lg:gap-6 lg:px-4">
            <div className="w-full space-y-4 lg:w-2/3 lg:space-y-6">
              <div className="space-y-2 lg:space-y-4">
                <h3 className="text-light-heading dark:text-dark-heading text-xl font-medium lg:text-2xl">
                  Description
                </h3>

                <p className="text-light-text dark:text-dark-text max-w-2xl text-sm lg:text-base">
                  {event.description}
                </p>
              </div>

              <ShareButtons url={eventUrl} title={event.title} />
            </div>

            <div className="w-full space-y-4 lg:w-1/3 lg:space-y-6">
              <h3 className="text-light-heading dark:text-dark-heading text-xl font-medium lg:text-2xl">
                Informations
              </h3>

              <ul className="flex flex-col items-start gap-1.5 lg:gap-3">
                {eventDate && (
                  <li className="text-light-text dark:text-dark-text flex items-center text-base lg:text-lg">
                    <Calendar className="mr-1 h-4 w-4 lg:mr-1.5 lg:h-5 lg:w-5" />

                    <p className="">
                      {eventDate.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                )}

                {event.time && (
                  <li className="text-light-text dark:text-dark-text flex items-center text-base lg:text-lg">
                    <TimerIcon className="mr-1 h-4 w-4 lg:mr-1.5 lg:h-5 lg:w-5" />

                    <p className="">{event.time}</p>
                  </li>
                )}

                {event.location && (
                  <li className="text-light-text dark:text-dark-text flex items-center text-base lg:text-lg">
                    <MapPin className="mr-1 h-4 w-4 lg:mr-1.5 lg:h-5 lg:w-5" />

                    <p className="">{event.location}</p>
                  </li>
                )}

                {event.price && (
                  <li className="text-light-text dark:text-dark-text flex items-center text-base lg:text-lg">
                    <Ticket className="mr-1 h-4 w-4 lg:mr-1.5 lg:h-5 lg:w-5" />

                    <p className="">{`${event.price} XOF`}</p>
                  </li>
                )}
              </ul>

              {isUpcoming ? (
                <CountdownTimer targetDate={eventDate} />
              ) : (
                <span className="bg-light-error/20 text-light-error/40 dark:bg-dark-error/40 dark:text-dark-error rounded-lg p-2 text-sm lg:text-base">
                  Cet événement est terminé
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
