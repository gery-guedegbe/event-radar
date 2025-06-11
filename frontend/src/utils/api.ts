import { Event } from "@/types/event";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://event-radar-neon.vercel.app";

export async function fetcher<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchEventById(id: string): Promise<Event | null> {
  try {
    const response = await fetch(`${API_BASE}/api/events/${id}`);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Upload failed");
  }

  const { url } = await res.json();
  return url;
};

// Remplace le typage du paramètre de createEvent pour accepter un Event sans id
export const createEvent = async (data: Omit<Event, "id">) => {
  try {
    // Si vous avez une image à uploader
    let imageUrl = "";

    if (data.image instanceof File) {
      imageUrl = await uploadImage(data.image);
      data.image = imageUrl;
    } else if (typeof data.image === "string") {
      imageUrl = data.image;
    }

    console.log("Payload envoyé au backend:", data);

    const res = await fetch(`${API_BASE}/api/events/create-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erreur lors de la création");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};
