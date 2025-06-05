import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher, API_BASE } from "../utils/api";
import { Event, EventFilter } from "../types/event";

interface QueryParams {
  limit: number;
  filters: EventFilter;
}

export function useInfiniteEvents({ limit, filters }: QueryParams) {
  return useInfiniteQuery({
    queryKey: ["events", filters] as const,
    queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (filters.category) params.set("category", filters.category);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (pageParam) params.set("cursor", pageParam);

      const url = `${API_BASE}/api/events?${params.toString()}`;
      const response = await fetcher<Event[]>(url);

      return {
        items: response,
        nextCursor:
          response.length > 0 ? response[response.length - 1].id : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}
