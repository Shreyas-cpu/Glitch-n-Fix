import { describe, it, expect } from "vitest";
import { Coin, WatchlistItem, PortfolioHolding, TradeTransaction } from "../types/market";

describe("Market Types", () => {
  it("should create a valid Coin object", () => {
    const coin: Coin = {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      current_price: 65000,
      price_change_percentage_24h: 2.5,
      market_cap: 1200000000000,
    };

    expect(coin.id).toBe("bitcoin");
    expect(coin.symbol).toBe("btc");
    expect(coin.current_price).toBe(65000);
    expect(coin.price_change_percentage_24h).toBe(2.5);
    expect(coin.market_cap).toBeGreaterThan(0);
  });

  it("should create a Coin with optional sparkline", () => {
    const coin: Coin = {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      current_price: 3500,
      price_change_percentage_24h: -1.2,
      market_cap: 420000000000,
      sparkline_in_7d: { price: [3400, 3450, 3500, 3480, 3520] },
    };

    expect(coin.sparkline_in_7d).toBeDefined();
    expect(coin.sparkline_in_7d!.price).toHaveLength(5);
  });

  it("should create a valid WatchlistItem", () => {
    const item: WatchlistItem = {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
    };

    expect(item.id).toBe("bitcoin");
    expect(item.symbol).toBe("btc");
    expect(item.name).toBe("Bitcoin");
  });

  it("should create a valid PortfolioHolding", () => {
    const holding: PortfolioHolding = {
      coinId: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5,
      avgPrice: 60000,
    };

    expect(holding.coinId).toBe("bitcoin");
    expect(holding.amount).toBe(0.5);
    expect(holding.avgPrice).toBe(60000);
    expect(holding.amount * holding.avgPrice).toBe(30000);
  });

  it("should create a valid TradeTransaction", () => {
    const tx: TradeTransaction = {
      id: "tx-123",
      type: "buy",
      coinId: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.1,
      pricePerUnit: 65000,
      total: 6500,
      timestamp: "2026-02-28T12:00:00Z",
    };

    expect(tx.type).toBe("buy");
    expect(tx.total).toBe(tx.amount * tx.pricePerUnit);
    expect(tx.pnl).toBeUndefined();
  });

  it("should create a sell transaction with P&L", () => {
    const tx: TradeTransaction = {
      id: "tx-456",
      type: "sell",
      coinId: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.1,
      pricePerUnit: 70000,
      total: 7000,
      pnl: 500,
      timestamp: "2026-02-28T12:00:00Z",
    };

    expect(tx.type).toBe("sell");
    expect(tx.pnl).toBe(500);
    expect(tx.pnl).toBeGreaterThan(0);
  });
});
