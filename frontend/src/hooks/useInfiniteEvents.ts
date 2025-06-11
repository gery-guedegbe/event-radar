import { useInfiniteQuery } from "@tanstack/react-query";
import { fetcher, API_BASE } from "../utils/api";
import { Event, EventFilter } from "../types/event";

interface QueryParams {
  limit: number;
  filters: EventFilter;
}

interface EventsResponse {
  data: Event[];
  pagination: {
    hasMore: boolean;
    cursor: string | null;
  };
}

export function useInfiniteEvents({ limit, filters }: QueryParams) {
  return useInfiniteQuery({
    queryKey: ["events", filters],
    queryFn: async ({ pageParam = null }: { pageParam: string | null }) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(pageParam && { cursor: pageParam }),
      });

      const url = `${API_BASE}/api/events?${params.toString()}`;
      const response = await fetcher<EventsResponse>(url);

      return {
        items: response.data,
        nextCursor: response.pagination.cursor,
        hasMore: response.pagination.hasMore,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
