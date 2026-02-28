import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface DeltaStatus {
  configured: boolean;
  baseUrl: string;
}

interface DeltaTicker {
  symbol: string;
  product_id: number;
  mark_price: string;
  spot_price: string;
  last_price?: string;
  volume: string;
  turnover: string;
  open: string;
  high: string;
  low: string;
  close: string;
  price_change_24h?: string;
  price_change_percent_24h?: string;
}

/**
 * Hook to check Delta API configuration status
 */
export function useDeltaStatus() {
  return useQuery<DeltaStatus>({
    queryKey: ["delta-status"],
    queryFn: async () => {
      const res = await axios.get("/api/delta/status");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * Hook to get live Delta tickers (market data)
 */
export function useDeltaTickers() {
  return useQuery<DeltaTicker[]>({
    queryKey: ["delta-tickers"],
    queryFn: async () => {
      const res = await axios.get("/api/delta/tickers");
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 2,
  });
}

/**
 * Hook to fetch OHLCV candle data for charts
 */
export function useDeltaCandles(symbol: string, resolution: string = "1h") {
  return useQuery<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>>({
    queryKey: ["delta-candles", symbol, resolution],
    queryFn: async () => {
      const res = await axios.get(`/api/delta/candles/${symbol}`, {
        params: { resolution },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!symbol,
    staleTime: 60_000,
    retry: 1,
  });
}
