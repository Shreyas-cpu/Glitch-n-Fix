import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PortfolioHolding, TradeTransaction } from "../types/market";

export function usePortfolio() {
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery<PortfolioHolding[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await axios.get("/api/portfolio");
      return res.data as PortfolioHolding[];
    },
  });

  const transactionsQuery = useQuery<TradeTransaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await axios.get("/api/transactions");
      return res.data as TradeTransaction[];
    },
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    portfolio: portfolioQuery.data ?? [],
    transactions: transactionsQuery.data ?? [],
    isLoading: portfolioQuery.isLoading,
    buy: buyMutation.mutateAsync,
    sell: sellMutation.mutateAsync,
    isBuying: buyMutation.isPending,
    isSelling: sellMutation.isPending,
    buyError: buyMutation.error,
    sellError: sellMutation.error,
  };
}
