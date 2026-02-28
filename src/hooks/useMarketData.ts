import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Coin } from "../types/market";

export function useMarketData() {
  return useQuery<Coin[]>({
    queryKey: ["marketData"],
    queryFn: async () => {
      const res = await axios.get("/api/market");
      return Array.isArray(res.data) ? (res.data as Coin[]) : [];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30_000, // Poll every 30 seconds for real-time feel
    staleTime: 25_000,
    retry: 2,
  });
}
