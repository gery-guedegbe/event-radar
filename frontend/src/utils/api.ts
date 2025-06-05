import { Event } from "@/types/event";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

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
