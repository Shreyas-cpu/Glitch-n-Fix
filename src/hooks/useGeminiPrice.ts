import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface GeminiTicker {
  bid: number;
  ask: number;
  last: number;
  symbol?: string;
  [key: string]: any;
}

export function useGeminiPrice(symbol: string = "btcusd") {
  return useQuery<GeminiTicker>({
    queryKey: ["gemini", symbol],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/gemini/price/${symbol}`, { timeout: 4000 });
        return res.data;
      } catch (e) {
        // fallback to public Gemini /ticker endpoint (no key required for public endpoints)
      }

      try {
        const publicRes = await axios.get(`https://api.gemini.com/v1/pubticker/${symbol}`, { timeout: 5000 });
        return publicRes.data;
      } catch (err) {
        // return a minimal fallback object
        return { bid: 0, ask: 0, last: 0 } as GeminiTicker;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 20, // poll Gemini every 20s
  });
}
