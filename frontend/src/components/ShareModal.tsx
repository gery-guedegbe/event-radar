import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { X } from "lucide-react";

interface ShareModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  event: Event;
}

const ShareModal = ({
  isModalOpen,
  setIsModalOpen,
  event,
}: ShareModalProps) => {
  const [eventUrl, setEventUrl] = useState("");

  useEffect(() => {
    // Cette solution fonctionne aussi bien en développement qu'en production
    setEventUrl(`${window.location.origin}/events/${event.id}`);
  }, [event.id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      alert("Lien copié !");
    } catch (err) {
      console.error("Failed to copy link: ", err);
      alert("Échec de la copie du lien");
    }
  };

  if (!isModalOpen) return null;

  return (
    <div>
      {/* MODAL */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-dark-background relative w-full max-w-sm cursor-pointer space-y-4 rounded-lg bg-white p-6 shadow-xl"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-dark-foreground dark:text-light-foreground absolute top-3 right-3 hover:opacity-70"
            >
              <X />
            </button>

            <h3 className="text-dark-foreground dark:text-light-foreground text-lg font-semibold">
              Partager l&apos;événement
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={copyLink}
                className="bg-light-primary/80 dark:bg-dark-primary/80 text-dark-heading hover:bg-light-primary/90 dark:hover:bg-dark-primary rounded px-4 py-2 text-sm"
              >
                Copier le lien
              </button>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700"
              >
                Partager sur Facebook
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(event.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#1DA1F2] px-4 py-2 text-center text-sm text-white hover:bg-[#0d8ddb]"
              >
                Partager sur X
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${event.title} - ${eventUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-green-500 px-4 py-2 text-center text-sm text-white hover:bg-green-600"
              >
                Partager sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareModal;
