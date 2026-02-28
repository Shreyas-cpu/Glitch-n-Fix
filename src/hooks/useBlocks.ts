import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// the endpoint returns a generic object from blockcypher; we'll type loosely
export function useBlocks() {
  return useQuery<any>({
    queryKey: ["blocks"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/blocks", { timeout: 5000 });
        return res.data;
      } catch (e) {
        // fallback to BlockCypher directly
      }
      const fallback = await axios.get("https://api.blockcypher.com/v1/eth/main", { timeout: 8000 });
      return fallback.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}
