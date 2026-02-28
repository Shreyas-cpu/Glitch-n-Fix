import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface TrendingItem {
  id: string;
  symbol: string;
  name: string;
  price_btc?: number;
  [key: string]: any;
}

export function useTrending() {
  return useQuery<TrendingItem[]>({
    queryKey: ["trending"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/trending", { timeout: 5000 });
        if (Array.isArray(res.data) && res.data.length) return res.data;
      } catch (e) {
        // fallback to CoinGecko directly
      }
      const fallback = await axios.get("https://api.coingecko.com/api/v3/search/trending", { timeout: 8000 });
      const coins = (fallback.data.coins || []).map((c: any) => c.item || {});
      return Array.isArray(coins) ? coins : [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60, // refresh every minute
  });
}
