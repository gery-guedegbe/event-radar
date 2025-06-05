import { fetchEventById } from "@/utils/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import CountdownTimer from "../../../components/CountdownTimer";
import ShareButtons from "../../../components/ShareButtons";

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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {event.image && (
          <div className="relative h-64 w-full">
            <Image
              src={event.image}
              alt={event.title}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              priority
            />
          </div>
        )}

        <h1 className="text-4xl font-bold">{event.title}</h1>

        <div className="flex items-center space-x-4 text-gray-400">
          <span>
            {eventDate.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>

          {event.category && (
            <span className="rounded bg-green-600 px-2 py-1 text-sm">
              {event.category}
            </span>
          )}
        </div>

        {isUpcoming && <CountdownTimer targetDate={eventDate} />}

        {event.price && (
          <p className="text-lg">
            Prix : {event.price} {event.priceCurrency}
          </p>
        )}

        {event.location && <p className="text-lg">Lieu : {event.location}</p>}

        {event.time && <p className="text-lg">Heure : {event.time}</p>}

        <div className="prose prose-invert max-w-none">
          <p>{event.description}</p>
        </div>

        <div className="flex items-center space-x-4">
          <ShareButtons url={eventUrl} title={event.title} />
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-green-500 px-4 py-2 hover:bg-green-400"
          >
            Consulter la source
          </a>
        </div>
      </div>
    </div>
  );
}
