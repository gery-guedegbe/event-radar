export interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  status: "upcoming" | "past";
  description?: string;
  time?: string;
  endDate?: string; // ISO string
  location?: string;
  link: string;
  image?: string;
  price?: string;
  priceCurrency?: string;
  source: string;
}

export interface EventFilter {
  category?: string;
  status?: "upcoming" | "past" | "all";
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface InfiniteEventsResponse {
  pages: PaginatedResponse<Event>[];
  pageParams: (string | null)[];
}
