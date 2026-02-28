import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Coin } from "../types/market";

export function useMarketData() {
  return useQuery<Coin[]>({
    queryKey: ["marketData"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/market");
        return Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}
