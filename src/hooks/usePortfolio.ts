import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PortfolioHolding, TradeTransaction } from "../types/market";
import { useCallback } from "react";

export function usePortfolio() {
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery<PortfolioHolding[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await axios.get("/api/portfolio");
      return res.data as PortfolioHolding[];
    },
    refetchInterval: 30_000,
  });

  const transactionsQuery = useQuery<TradeTransaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await axios.get("/api/transactions");
      return res.data as TradeTransaction[];
    },
    refetchInterval: 30_000,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const buyMutation = useMutation({
    mutationFn: async (params: {
      coinId: string;
      symbol: string;
      name: string;
      amount: number;
      pricePerUnit: number;
    }) => {
      const res = await axios.post("/api/portfolio/buy", params);
      return res.data;
    },
    onSuccess: invalidateAll,
  });

  const sellMutation = useMutation({
    mutationFn: async (params: {
      coinId: string;
      amount: number;
      pricePerUnit: number;
    }) => {
      const res = await axios.post("/api/portfolio/sell", params);
      return res.data;
    },
    onSuccess: invalidateAll,
  });

  const setSLTPMutation = useMutation({
    mutationFn: async (params: {
      coinId: string;
      stopLoss: number | null;
      takeProfit: number | null;
    }) => {
      const res = await axios.post("/api/portfolio/sltp", params);
      return res.data;
    },
    onSuccess: invalidateAll,
  });

  const checkSLTP = useCallback(
    async (prices: Record<string, number>) => {
      try {
        const res = await axios.post("/api/portfolio/check-sltp", { prices });
        if (res.data.triggered?.length > 0) {
          invalidateAll();
        }
        return res.data as { triggered: TradeTransaction[]; portfolio: PortfolioHolding[] };
      } catch {
        return { triggered: [], portfolio: [] };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    portfolio: portfolioQuery.data ?? [],
    transactions: transactionsQuery.data ?? [],
    isLoading: portfolioQuery.isLoading,
    buy: buyMutation.mutateAsync,
    sell: sellMutation.mutateAsync,
    setSLTP: setSLTPMutation.mutateAsync,
    checkSLTP,
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
    buyError: buyMutation.error,
    sellError: sellMutation.error,
  };
}
