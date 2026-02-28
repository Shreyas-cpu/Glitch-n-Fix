import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo } from "react";
import { Coin } from "../types/market";
import { SortConfig, SortField } from "../components/ui/MarketTable";

export function useMarketData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "market_cap",
    direction: "desc",
  });

  const { data: coins = [], isLoading } = useQuery({
    queryKey: ["marketData"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/market", { timeout: 5000 });
        if (Array.isArray(res.data) && res.data.length) return res.data;
      } catch (e) {
        // fallback to direct CoinGecko if local proxy is unavailable
      }

      const fallback = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 10,
            page: 1,
            sparkline: true,
          },
          timeout: 8000,
        }
      );
      return Array.isArray(fallback.data) ? fallback.data : [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 15, // poll every 15s for near real-time
  });

  const filteredCoins = useMemo(() => {
    const filtered = coins.filter(
      (c: Coin) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a: Coin, b: Coin) => {
      const field = sortConfig.field;
      const valA = a[field] as string | number;
      const valB = b[field] as string | number;

      if (typeof valA === "string" && typeof valB === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortConfig.direction === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [coins, searchQuery, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  return {
    coins,
    filteredCoins,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
  };
}