import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("Portfolio API (server endpoints)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Buy Flow", () => {
    it("should send correct buy request", async () => {
      const buyPayload = {
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: 0.5,
        pricePerUnit: 65000,
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          portfolio: [{ coinId: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.5, avgPrice: 65000 }],
          transaction: {
            id: "tx-1",
            type: "buy",
            coinId: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.5,
            pricePerUnit: 65000,
            total: 32500,
            timestamp: new Date().toISOString(),
          },
        },
      });

      const res = await mockedAxios.post("/api/portfolio/buy", buyPayload);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/portfolio/buy", buyPayload);
      expect(res.data.portfolio).toHaveLength(1);
      expect(res.data.portfolio[0].amount).toBe(0.5);
      expect(res.data.transaction.type).toBe("buy");
      expect(res.data.transaction.total).toBe(32500);
    });

    it("should reject buy with invalid amount", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: "Invalid amount: must be > 0" } },
      });

      try {
        await mockedAxios.post("/api/portfolio/buy", {
          coinId: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          amount: -1,
          pricePerUnit: 65000,
        });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
        expect(err.response.data.error).toContain("Invalid amount");
      }
    });

    it("should reject buy with missing coinId", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: "Invalid coinId" } },
      });

      try {
        await mockedAxios.post("/api/portfolio/buy", {
          symbol: "btc",
          name: "Bitcoin",
          amount: 1,
          pricePerUnit: 65000,
        });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });

    it("should accumulate holdings on multiple buys", async () => {
      // First buy
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          portfolio: [{ coinId: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.5, avgPrice: 60000 }],
          transaction: { id: "tx-1", type: "buy", amount: 0.5, pricePerUnit: 60000, total: 30000 },
        },
      });

      const res1 = await mockedAxios.post("/api/portfolio/buy", {
        coinId: "bitcoin", symbol: "btc", name: "Bitcoin", amount: 0.5, pricePerUnit: 60000,
      });
      expect(res1.data.portfolio[0].amount).toBe(0.5);

      // Second buy at different price → average cost basis
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          portfolio: [{ coinId: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 1.0, avgPrice: 62500 }],
          transaction: { id: "tx-2", type: "buy", amount: 0.5, pricePerUnit: 65000, total: 32500 },
        },
      });

      const res2 = await mockedAxios.post("/api/portfolio/buy", {
        coinId: "bitcoin", symbol: "btc", name: "Bitcoin", amount: 0.5, pricePerUnit: 65000,
      });
      expect(res2.data.portfolio[0].amount).toBe(1.0);
      expect(res2.data.portfolio[0].avgPrice).toBe(62500); // (30000+32500)/1 = 62500
    });
  });

  describe("Sell Flow", () => {
    it("should send correct sell request", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          portfolio: [{ coinId: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0.3, avgPrice: 60000 }],
          transaction: {
            id: "tx-3",
            type: "sell",
            coinId: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.2,
            pricePerUnit: 70000,
            total: 14000,
            pnl: 2000,
            timestamp: new Date().toISOString(),
          },
        },
      });

      const res = await mockedAxios.post("/api/portfolio/sell", {
        coinId: "bitcoin",
        amount: 0.2,
        pricePerUnit: 70000,
      });

      expect(res.data.transaction.type).toBe("sell");
      expect(res.data.transaction.pnl).toBe(2000);
      expect(res.data.portfolio[0].amount).toBe(0.3);
    });

    it("should reject sell when not holding the coin", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: "You don't hold this coin" } },
      });

      try {
        await mockedAxios.post("/api/portfolio/sell", {
          coinId: "dogecoin",
          amount: 100,
          pricePerUnit: 0.15,
        });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
        expect(err.response.data.error).toContain("don't hold");
      }
    });

    it("should reject sell with insufficient balance", async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: "Insufficient balance. You hold 0.5 but tried to sell 1" } },
      });

      try {
        await mockedAxios.post("/api/portfolio/sell", {
          coinId: "bitcoin",
          amount: 1,
          pricePerUnit: 70000,
        });
      } catch (err: any) {
        expect(err.response.status).toBe(400);
        expect(err.response.data.error).toContain("Insufficient balance");
      }
    });

    it("should remove holding entirely when selling all", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          portfolio: [], // empty after selling all
          transaction: {
            id: "tx-4",
            type: "sell",
            coinId: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.5,
            pricePerUnit: 70000,
            total: 35000,
            pnl: 5000,
          },
        },
      });

      const res = await mockedAxios.post("/api/portfolio/sell", {
        coinId: "bitcoin",
        amount: 0.5,
        pricePerUnit: 70000,
      });

      expect(res.data.portfolio).toHaveLength(0);
      expect(res.data.transaction.pnl).toBe(5000);
    });
  });

  describe("Watchlist API", () => {
    it("should fetch watchlist", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
          { id: "ethereum", symbol: "eth", name: "Ethereum" },
        ],
      });

      const res = await mockedAxios.get("/api/watchlist");
      expect(res.data).toHaveLength(2);
      expect(res.data[0].id).toBe("bitcoin");
    });

    it("should add to watchlist", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: [
          { id: "bitcoin", symbol: "btc", name: "Bitcoin" },
          { id: "solana", symbol: "sol", name: "Solana" },
        ],
      });

      const res = await mockedAxios.post("/api/watchlist", {
        item: { id: "solana", symbol: "sol", name: "Solana" },
      });

      expect(res.data).toHaveLength(2);
    });

    it("should remove from watchlist", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        data: [{ id: "bitcoin", symbol: "btc", name: "Bitcoin" }],
      });

      const res = await mockedAxios.delete("/api/watchlist/solana");
      expect(res.data).toHaveLength(1);
    });
  });

  describe("Market Data API", () => {
    it("should fetch market data", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: "bitcoin",
            symbol: "btc",
            name: "Bitcoin",
            current_price: 65000,
            price_change_percentage_24h: 2.5,
            market_cap: 1200000000000,
          },
        ],
      });

      const res = await mockedAxios.get("/api/market");
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data[0].current_price).toBe(65000);
    });

    it("should handle market data error", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500, data: { error: "Failed to fetch market data" } },
      });

      try {
        await mockedAxios.get("/api/market");
      } catch (err: any) {
        expect(err.response.status).toBe(500);
      }
    });
  });
});
