import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { WatchlistItem } from "../types/market";

export function useWatchlist() {
  const queryClient = useQueryClient();

  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await axios.get("/api/watchlist");
      const data = res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const addToWatchlist = useMutation({
    mutationFn: (item: WatchlistItem) =>
      axios.post("/api/watchlist", { item }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const removeFromWatchlist = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/watchlist/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    watchlistIds: Array.isArray(watchlist) ? watchlist.map((i: WatchlistItem) => i.id) : [],
  };
}