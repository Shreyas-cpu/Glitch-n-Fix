import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import * as delta from "./src/lib/deltaClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

// ── Caches ──────────────────────────────────────────────────────────
let marketCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000;

let deltaTickerCache: any[] | null = null;
let deltaTickerCacheTime = 0;
const DELTA_CACHE_DURATION = 30 * 1000; // 30s for Delta tickers

let deltaProductCache: any[] | null = null;
let deltaProductCacheTime = 0;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const readDB = async () => {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      return { watchlist: [], portfolio: [], transactions: [] };
    }
  };

  const writeDB = async (data: any) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  };

  // Market Data (CoinGecko proxy with cache)
  app.get("/api/market", async (_req, res) => {
    const now = Date.now();

    if (marketCache && now - lastFetchTime < CACHE_DURATION) {
      return res.json(marketCache);
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=true"
      );

      if (!response.ok) {
        return res
          .status(response.status)
          .json({ error: "CoinGecko API failed" });
      }

      const data = await response.json();
      marketCache = data;
      lastFetchTime = now;
      res.json(data);
    } catch (error) {
      console.error("Market fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // ── Watchlist CRUD ──

  app.get("/api/watchlist", async (_req, res) => {
    const db = await readDB();
    res.json(db.watchlist || []);
  });

  app.post("/api/watchlist", async (req, res) => {
    const { item } = req.body;

    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.symbol !== "string" ||
      !item.id.trim() ||
      !item.name.trim() ||
      !item.symbol.trim()
    ) {
      return res.status(400).json({ error: "Invalid watchlist item" });
    }

    const sanitizedItem = {
      id: item.id.trim().toLowerCase(),
      name: item.name.trim().substring(0, 100),
      symbol: item.symbol.trim().substring(0, 20).toLowerCase(),
    };

    const db = await readDB();
    if (!db.watchlist) db.watchlist = [];

    if (!db.watchlist.find((i: any) => i.id === sanitizedItem.id)) {
      db.watchlist.push(sanitizedItem);
      await writeDB(db);
    }

    res.json(db.watchlist);
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid id" });
    }

    const db = await readDB();
    if (!db.watchlist) db.watchlist = [];
    db.watchlist = db.watchlist.filter((i: any) => i.id !== id);
    await writeDB(db);

    res.json(db.watchlist);
  });

  // ── Portfolio CRUD ──

  app.get("/api/portfolio", async (_req, res) => {
    const db = await readDB();
    res.json(db.portfolio || []);
  });

  // BUY – adds to portfolio, records transaction
  app.post("/api/portfolio/buy", async (req, res) => {
    const { coinId, symbol, name, amount, pricePerUnit } = req.body;

    // Input validation
    if (!coinId || typeof coinId !== "string" || !coinId.trim()) {
      return res.status(400).json({ error: "Invalid coinId" });
    }
    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({ error: "Invalid symbol" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 1e12) {
      return res.status(400).json({ error: "Invalid amount: must be > 0" });
    }
    if (typeof pricePerUnit !== "number" || !Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      return res.status(400).json({ error: "Invalid pricePerUnit" });
    }

    const db = await readDB();
    if (!db.portfolio) db.portfolio = [];
    if (!db.transactions) db.transactions = [];

    const existing = db.portfolio.find((p: any) => p.coinId === coinId.trim().toLowerCase());
    const totalCost = amount * pricePerUnit;

    if (existing) {
      // Average cost basis
      const totalPrevCost = existing.amount * existing.avgPrice;
      existing.amount += amount;
      existing.avgPrice = (totalPrevCost + totalCost) / existing.amount;
    } else {
      db.portfolio.push({
        coinId: coinId.trim().toLowerCase(),
        symbol: symbol.trim().toUpperCase(),
        name: name.trim().substring(0, 100),
        amount,
        avgPrice: pricePerUnit,
      });
    }

    // Record transaction
    db.transactions.unshift({
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "buy",
      coinId: coinId.trim().toLowerCase(),
      symbol: symbol.trim().toUpperCase(),
      name: name.trim().substring(0, 100),
      amount,
      pricePerUnit,
      total: totalCost,
      timestamp: new Date().toISOString(),
    });

    // Keep last 100 transactions
    if (db.transactions.length > 100) {
      db.transactions = db.transactions.slice(0, 100);
    }

    await writeDB(db);
    res.json({ portfolio: db.portfolio, transaction: db.transactions[0] });
  });

  // SELL – removes from portfolio, records transaction
  app.post("/api/portfolio/sell", async (req, res) => {
    const { coinId, amount, pricePerUnit } = req.body;

    if (!coinId || typeof coinId !== "string") {
      return res.status(400).json({ error: "Invalid coinId" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount: must be > 0" });
    }
    if (typeof pricePerUnit !== "number" || !Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      return res.status(400).json({ error: "Invalid pricePerUnit" });
    }

    const db = await readDB();
    if (!db.portfolio) db.portfolio = [];
    if (!db.transactions) db.transactions = [];

    const existing = db.portfolio.find((p: any) => p.coinId === coinId.trim().toLowerCase());

    if (!existing) {
      return res.status(400).json({ error: "You don't hold this coin" });
    }
    if (existing.amount < amount) {
      return res.status(400).json({
        error: `Insufficient balance. You hold ${existing.amount} but tried to sell ${amount}`,
      });
    }

    const totalRevenue = amount * pricePerUnit;
    existing.amount -= amount;

    // Remove from portfolio if amount reaches 0
    if (existing.amount <= 1e-10) {
      db.portfolio = db.portfolio.filter((p: any) => p.coinId !== coinId.trim().toLowerCase());
    }

    // Record transaction
    db.transactions.unshift({
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "sell",
      coinId: coinId.trim().toLowerCase(),
      symbol: existing.symbol,
      name: existing.name,
      amount,
      pricePerUnit,
      total: totalRevenue,
      pnl: (pricePerUnit - existing.avgPrice) * amount,
      timestamp: new Date().toISOString(),
    });

    if (db.transactions.length > 100) {
      db.transactions = db.transactions.slice(0, 100);
    }

    await writeDB(db);
    res.json({ portfolio: db.portfolio, transaction: db.transactions[0] });
  });

  // Transaction history
  app.get("/api/transactions", async (_req, res) => {
    const db = await readDB();
    res.json(db.transactions || []);
  });

  // ── Stop Loss / Take Profit ──

  // Set SL/TP for a holding
  app.post("/api/portfolio/sltp", async (req, res) => {
    const { coinId, stopLoss, takeProfit } = req.body;

    if (!coinId || typeof coinId !== "string") {
      return res.status(400).json({ error: "Invalid coinId" });
    }
    if (stopLoss !== null && stopLoss !== undefined) {
      if (typeof stopLoss !== "number" || !Number.isFinite(stopLoss) || stopLoss < 0) {
        return res.status(400).json({ error: "Invalid stopLoss value" });
      }
    }
    if (takeProfit !== null && takeProfit !== undefined) {
      if (typeof takeProfit !== "number" || !Number.isFinite(takeProfit) || takeProfit < 0) {
        return res.status(400).json({ error: "Invalid takeProfit value" });
      }
    }

    const db = await readDB();
    if (!db.portfolio) db.portfolio = [];

    const holding = db.portfolio.find((p: any) => p.coinId === coinId.trim().toLowerCase());
    if (!holding) {
      return res.status(404).json({ error: "Holding not found" });
    }

    holding.stopLoss = stopLoss ?? null;
    holding.takeProfit = takeProfit ?? null;
    await writeDB(db);

    res.json({ holding });
  });

  // Check SL/TP triggers against current prices
  app.post("/api/portfolio/check-sltp", async (req, res) => {
    const { prices } = req.body; // { [coinId]: currentPrice }

    if (!prices || typeof prices !== "object") {
      return res.status(400).json({ error: "Invalid prices object" });
    }

    const db = await readDB();
    if (!db.portfolio) db.portfolio = [];
    if (!db.transactions) db.transactions = [];

    const triggered: any[] = [];

    for (const holding of [...db.portfolio]) {
      const currentPrice = prices[holding.coinId];
      if (typeof currentPrice !== "number" || !Number.isFinite(currentPrice)) continue;

      let triggerType: "stop-loss" | "take-profit" | null = null;

      if (holding.stopLoss && currentPrice <= holding.stopLoss) {
        triggerType = "stop-loss";
      } else if (holding.takeProfit && currentPrice >= holding.takeProfit) {
        triggerType = "take-profit";
      }

      if (triggerType) {
        const totalRevenue = holding.amount * currentPrice;
        const pnl = (currentPrice - holding.avgPrice) * holding.amount;

        // Record transaction
        const tx = {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: "sell" as const,
          coinId: holding.coinId,
          symbol: holding.symbol,
          name: holding.name,
          amount: holding.amount,
          pricePerUnit: currentPrice,
          total: totalRevenue,
          pnl,
          trigger: triggerType,
          timestamp: new Date().toISOString(),
        };

        db.transactions.unshift(tx);
        triggered.push(tx);

        // Remove holding
        db.portfolio = db.portfolio.filter((p: any) => p.coinId !== holding.coinId);
      }
    }

    if (db.transactions.length > 100) {
      db.transactions = db.transactions.slice(0, 100);
    }

    if (triggered.length > 0) {
      await writeDB(db);
    }

    res.json({ triggered, portfolio: db.portfolio });
  });

  // ── Delta Exchange API Proxy ──────────────────────────────────────

  // Status check — is Delta API configured?
  app.get("/api/delta/status", (_req, res) => {
    res.json({
      configured: delta.isDeltaConfigured(),
      baseUrl: process.env.DELTA_API_BASE_URL || "https://api.delta.exchange",
    });
  });

  // Delta tickers — live market data (cached 30s)
  app.get("/api/delta/tickers", async (_req, res) => {
    const now = Date.now();
    if (deltaTickerCache && now - deltaTickerCacheTime < DELTA_CACHE_DURATION) {
      return res.json(deltaTickerCache);
    }
    try {
      const tickers = await delta.getTickers();
      deltaTickerCache = tickers;
      deltaTickerCacheTime = now;
      res.json(tickers);
    } catch (err: any) {
      console.error("Delta tickers error:", err.message);
      // Return cached data if available, else empty
      res.json(deltaTickerCache || []);
    }
  });

  // Single ticker
  app.get("/api/delta/ticker/:symbol", async (req, res) => {
    try {
      const ticker = await delta.getTicker(req.params.symbol);
      if (!ticker) return res.status(404).json({ error: "Ticker not found" });
      res.json(ticker);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Delta products (trading pairs)
  app.get("/api/delta/products", async (_req, res) => {
    const now = Date.now();
    if (deltaProductCache && now - deltaProductCacheTime < CACHE_DURATION) {
      return res.json(deltaProductCache);
    }
    try {
      const products = await delta.getProducts();
      deltaProductCache = products;
      deltaProductCacheTime = now;
      res.json(products);
    } catch (err: any) {
      console.error("Delta products error:", err.message);
      res.json(deltaProductCache || []);
    }
  });

  // Historical candles for charts
  app.get("/api/delta/candles/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const resolution = (req.query.resolution as string) || "1h";
    const start = req.query.start ? Number(req.query.start) : undefined;
    const end = req.query.end ? Number(req.query.end) : undefined;
    try {
      const candles = await delta.getHistoricalPrices(symbol, resolution, start, end);
      res.json(candles);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Order book
  app.get("/api/delta/orderbook/:productId", async (req, res) => {
    const productId = Number(req.params.productId);
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    try {
      const book = await delta.getOrderBook(productId);
      res.json(book);
    } catch (err: any) {
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Place order (authenticated)
  app.post("/api/delta/orders", async (req, res) => {
    const { product_id, side, size, order_type, limit_price, stop_price, stop_order_type } = req.body;

    // Validate required fields
    if (!product_id || typeof product_id !== "number") {
      return res.status(400).json({ error: "Invalid product_id" });
    }
    if (!["buy", "sell"].includes(side)) {
      return res.status(400).json({ error: "Side must be 'buy' or 'sell'" });
    }
    if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
      return res.status(400).json({ error: "Invalid size" });
    }
    if (!["limit_order", "market_order"].includes(order_type)) {
      return res.status(400).json({ error: "Invalid order_type" });
    }

    try {
      const order = await delta.placeOrder({
        product_id,
        side,
        size,
        order_type,
        limit_price,
        stop_price,
        stop_order_type,
      });
      res.json(order);
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get positions (authenticated)
  app.get("/api/delta/positions", async (_req, res) => {
    try {
      const positions = await delta.getPositions();
      res.json(positions);
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get open orders (authenticated)
  app.get("/api/delta/orders", async (req, res) => {
    const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
    try {
      const orders = await delta.getOpenOrders(productId);
      res.json(orders);
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get trade history / fills (authenticated)
  app.get("/api/delta/fills", async (req, res) => {
    const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
    try {
      const fills = await delta.getTradeHistory(productId);
      res.json(fills);
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Cancel order (authenticated)
  app.delete("/api/delta/orders", async (req, res) => {
    const { id, product_id } = req.body;
    if (!id || !product_id) {
      return res.status(400).json({ error: "id and product_id required" });
    }
    try {
      await delta.cancelOrder(id, product_id);
      res.json({ success: true });
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Delta wallet / balances (authenticated)
  app.get("/api/delta/wallet", async (_req, res) => {
    try {
      const wallet = await delta.getPortfolio();
      res.json(wallet);
    } catch (err: any) {
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // ── Vite dev middleware or static serve ──

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();