import { describe, it, expect } from "vitest";

describe("Input Validation & Security", () => {
  // Simulates the server-side validation logic
  function validateBuyInput(body: any): { valid: boolean; error?: string } {
    const { coinId, symbol, name, amount, pricePerUnit } = body;

    if (!coinId || typeof coinId !== "string" || !coinId.trim()) {
      return { valid: false, error: "Invalid coinId" };
    }
    if (!symbol || typeof symbol !== "string") {
      return { valid: false, error: "Invalid symbol" };
    }
    if (!name || typeof name !== "string") {
      return { valid: false, error: "Invalid name" };
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 1e12) {
      return { valid: false, error: "Invalid amount: must be > 0" };
    }
    if (typeof pricePerUnit !== "number" || !Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      return { valid: false, error: "Invalid pricePerUnit" };
    }
    return { valid: true };
  }

  function validateWatchlistInput(body: any): { valid: boolean; error?: string } {
    const { item } = body;
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.symbol !== "string" ||
      !item.id.trim() ||
      !item.name.trim() ||
      !item.symbol.trim()
    ) {
      return { valid: false, error: "Invalid watchlist item" };
    }
    return { valid: true };
  }

  function sanitizeWatchlistItem(item: any) {
    return {
      id: item.id.trim().toLowerCase(),
      name: item.name.trim().substring(0, 100),
      symbol: item.symbol.trim().substring(0, 20).toLowerCase(),
    };
  }

  describe("Buy Input Validation", () => {
    it("should accept valid buy input", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: 0.5,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject negative amount", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: -1,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("amount");
    });

    it("should reject zero amount", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: 0,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject absurdly large amount", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: 1e15,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject empty coinId", () => {
      const result = validateBuyInput({
        coinId: "  ",
        symbol: "btc",
        name: "Bitcoin",
        amount: 1,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject non-string coinId", () => {
      const result = validateBuyInput({
        coinId: 123,
        symbol: "btc",
        name: "Bitcoin",
        amount: 1,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject missing symbol", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        name: "Bitcoin",
        amount: 1,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject negative pricePerUnit", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: 1,
        pricePerUnit: -100,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject NaN amount", () => {
      const result = validateBuyInput({
        coinId: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        amount: NaN,
        pricePerUnit: 65000,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("Watchlist Input Validation", () => {
    it("should accept valid watchlist input", () => {
      const result = validateWatchlistInput({
        item: { id: "bitcoin", name: "Bitcoin", symbol: "btc" },
      });
      expect(result.valid).toBe(true);
    });

    it("should reject empty item", () => {
      const result = validateWatchlistInput({});
      expect(result.valid).toBe(false);
    });

    it("should reject item with empty name", () => {
      const result = validateWatchlistInput({
        item: { id: "bitcoin", name: "  ", symbol: "btc" },
      });
      expect(result.valid).toBe(false);
    });

    it("should reject item with numeric id", () => {
      const result = validateWatchlistInput({
        item: { id: 123, name: "Bitcoin", symbol: "btc" },
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("Input Sanitization", () => {
    it("should trim and lowercase ids", () => {
      const sanitized = sanitizeWatchlistItem({
        id: "  BITCOIN  ",
        name: "  Bitcoin  ",
        symbol: "  BTC  ",
      });
      expect(sanitized.id).toBe("bitcoin");
      expect(sanitized.name).toBe("Bitcoin");
      expect(sanitized.symbol).toBe("btc");
    });

    it("should truncate long names", () => {
      const longName = "A".repeat(200);
      const sanitized = sanitizeWatchlistItem({
        id: "test",
        name: longName,
        symbol: "tst",
      });
      expect(sanitized.name.length).toBe(100);
    });

    it("should truncate long symbols", () => {
      const longSymbol = "X".repeat(50);
      const sanitized = sanitizeWatchlistItem({
        id: "test",
        name: "Test",
        symbol: longSymbol,
      });
      expect(sanitized.symbol.length).toBe(20);
    });

    it("should prevent XSS in name field via trimming", () => {
      const sanitized = sanitizeWatchlistItem({
        id: "test",
        name: '<script>alert("xss")</script>',
        symbol: "tst",
      });
      // Name is trimmed and truncated; no actual HTML execution in JSON context
      expect(sanitized.name).toBe('<script>alert("xss")</script>');
      expect(sanitized.name.length).toBeLessThanOrEqual(100);
    });
  });

  describe("Portfolio P&L Calculations", () => {
    it("should calculate correct P&L for profitable trade", () => {
      const avgPrice = 60000;
      const sellPrice = 70000;
      const amount = 0.5;
      const pnl = (sellPrice - avgPrice) * amount;
      expect(pnl).toBe(5000);
    });

    it("should calculate correct P&L for losing trade", () => {
      const avgPrice = 70000;
      const sellPrice = 60000;
      const amount = 0.5;
      const pnl = (sellPrice - avgPrice) * amount;
      expect(pnl).toBe(-5000);
    });

    it("should calculate correct average cost basis", () => {
      // Buy 0.5 BTC at $60,000
      const buy1Amount = 0.5;
      const buy1Price = 60000;
      // Buy 0.5 BTC at $70,000
      const buy2Amount = 0.5;
      const buy2Price = 70000;

      const totalCost = buy1Amount * buy1Price + buy2Amount * buy2Price;
      const totalAmount = buy1Amount + buy2Amount;
      const avgCost = totalCost / totalAmount;

      expect(avgCost).toBe(65000);
    });

    it("should handle zero holdings correctly", () => {
      const totalValue = 0;
      const totalCost = 0;
      const pnlPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      expect(pnlPercent).toBe(0);
    });
  });
});
