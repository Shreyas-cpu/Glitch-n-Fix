import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as delta from "./src/lib/deltaClient.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

// ── Logger Utility ──────────────────────────────────────────────────
const LOG_COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const log = {
  _fmt(level: string, color: string, msg: string, meta?: Record<string, any>) {
    const ts = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    console.log(`${color}[${ts}] [${level}]${LOG_COLORS.reset} ${msg}${LOG_COLORS.gray}${metaStr}${LOG_COLORS.reset}`);
  },
  info(msg: string, meta?: Record<string, any>) { this._fmt("INFO", LOG_COLORS.blue, msg, meta); },
  success(msg: string, meta?: Record<string, any>) { this._fmt("OK", LOG_COLORS.green, msg, meta); },
  warn(msg: string, meta?: Record<string, any>) { this._fmt("WARN", LOG_COLORS.yellow, msg, meta); },
  error(msg: string, meta?: Record<string, any>) { this._fmt("ERROR", LOG_COLORS.red, msg, meta); },
  request(method: string, url: string, status: number, durationMs: number) {
    const color = status >= 500 ? LOG_COLORS.red : status >= 400 ? LOG_COLORS.yellow : LOG_COLORS.green;
    const ts = new Date().toISOString();
    console.log(`${LOG_COLORS.cyan}[${ts}] [REQ]${LOG_COLORS.reset} ${method} ${url} ${color}${status}${LOG_COLORS.reset} ${LOG_COLORS.gray}${durationMs}ms${LOG_COLORS.reset}`);
  },
  delta(msg: string, meta?: Record<string, any>) { this._fmt("DELTA", LOG_COLORS.magenta, msg, meta); },
  auth(msg: string, meta?: Record<string, any>) { this._fmt("AUTH", LOG_COLORS.cyan, msg, meta); },
  trade(msg: string, meta?: Record<string, any>) { this._fmt("TRADE", LOG_COLORS.yellow, msg, meta); },
};

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

  // ── Request Logger Middleware ──────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    const originalEnd = res.end.bind(res);
    (res as any).end = (...args: any[]) => {
      const duration = Date.now() - start;
      log.request(req.method, req.originalUrl, res.statusCode, duration);
      return (originalEnd as Function)(...args);
    };
    next();
  });

  log.info("Initializing server...");

  const readDB = async () => {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      return { users: [], watchlist: [], portfolio: [], transactions: [] };
    }
  };

  const writeDB = async (data: any) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  };

  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";
  const JWT_EXPIRES = "7d";

  // Helper: generate JWT
  const signToken = (user: { id: string; email: string; name: string }) =>
    jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  // Helper: verify JWT middleware
  const authMiddleware = (req: any, res: any, next: any) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    try {
      const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };

  // ── Auth: Sign Up ──
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      log.auth(`Signup attempt`, { email });

      if (!name || typeof name !== "string" || name.trim().length < 2) {
        log.auth("Signup rejected: name too short", { email });
        return res.status(400).json({ error: "Name must be at least 2 characters" });
      }
      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        log.auth("Signup rejected: invalid email");
        return res.status(400).json({ error: "Invalid email address" });
      }
      if (!password || typeof password !== "string" || password.length < 6) {
        log.auth("Signup rejected: weak password", { email });
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const db = await readDB();
      if (!db.users) db.users = [];

      const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        log.auth("Signup rejected: email already exists", { email });
        return res.status(409).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim().substring(0, 50),
        email: email.trim().toLowerCase().substring(0, 100),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      db.users.push(user);
      await writeDB(db);

      const token = signToken(user);
      log.auth(`Signup successful`, { userId: user.id, email: user.email });
      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err) {
      log.error("Signup error", { error: (err as Error).message });
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // ── Auth: Sign In ──
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      log.auth("Signin attempt", { email });

      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Password is required" });
      }

      const db = await readDB();
      if (!db.users) db.users = [];

      const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        log.auth("Signin failed: user not found", { email });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        log.auth("Signin failed: wrong password", { email });
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = signToken(user);
      log.auth("Signin successful", { userId: user.id, email: user.email });
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err) {
      log.error("Signin error", { error: (err as Error).message });
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── Auth: Get Current User (verify token) ──
  app.get("/api/auth/me", authMiddleware, (req: any, res) => {
    log.auth("Token verified", { userId: req.user.id });
    res.json({ user: req.user });
  });

  // Market Data (CoinGecko proxy with cache)
  app.get("/api/market", async (_req, res) => {
    const now = Date.now();

    if (marketCache && now - lastFetchTime < CACHE_DURATION) {
      log.info("Market data served from cache", { age: `${Math.round((now - lastFetchTime) / 1000)}s` });
      return res.json(marketCache);
    }

    try {
      log.info("Fetching market data from CoinGecko...");
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
      log.success(`Market data fetched`, { coins: data.length });
      res.json(data);
    } catch (error) {
      log.error("Market fetch error", { error: (error as Error).message });
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
    log.info("Adding to watchlist", { coinId: item?.id });

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
      log.success("Added to watchlist", { coinId: sanitizedItem.id, total: db.watchlist.length });
    } else {
      log.info("Already in watchlist", { coinId: sanitizedItem.id });
    }

    res.json(db.watchlist);
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    const { id } = req.params;
    log.info("Removing from watchlist", { coinId: id });

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid id" });
    }

    const db = await readDB();
    if (!db.watchlist) db.watchlist = [];
    const prevLen = db.watchlist.length;
    db.watchlist = db.watchlist.filter((i: any) => i.id !== id);
    await writeDB(db);

    log.success("Removed from watchlist", { coinId: id, removed: prevLen !== db.watchlist.length });
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
    log.trade("BUY order received", { coinId, symbol, amount, pricePerUnit });

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
    log.trade("BUY executed", { coinId: coinId.trim().toLowerCase(), amount, total: totalCost, holdings: db.portfolio.length });
    res.json({ portfolio: db.portfolio, transaction: db.transactions[0] });
  });

  // SELL – removes from portfolio, records transaction
  app.post("/api/portfolio/sell", async (req, res) => {
    const { coinId, amount, pricePerUnit } = req.body;
    log.trade("SELL order received", { coinId, amount, pricePerUnit });

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
    const pnl = (pricePerUnit - existing.avgPrice) * amount;
    log.trade("SELL executed", { coinId: coinId.trim().toLowerCase(), amount, total: amount * pricePerUnit, pnl: pnl.toFixed(2) });
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
    log.trade("Setting SL/TP", { coinId, stopLoss, takeProfit });

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

    log.trade("SL/TP updated", { coinId, stopLoss: holding.stopLoss, takeProfit: holding.takeProfit });
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
        log.trade(`SL/TP TRIGGERED: ${triggerType}`, { coinId: holding.coinId, currentPrice, stopLoss: holding.stopLoss, takeProfit: holding.takeProfit });
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
      log.trade(`SL/TP check complete: ${triggered.length} triggered`, { coins: triggered.map((t: any) => t.coinId) });
    }

    res.json({ triggered, portfolio: db.portfolio });
  });

  // ── Delta Exchange API Proxy ──────────────────────────────────────

  // Status check — is Delta API configured?
  app.get("/api/delta/status", (_req, res) => {
    const configured = delta.isDeltaConfigured();
    log.delta("Status check", { configured });
    res.json({
      configured,
      baseUrl: process.env.DELTA_API_BASE_URL || "https://api.delta.exchange",
    });
  });

  // Delta tickers — live market data (cached 30s)
  app.get("/api/delta/tickers", async (_req, res) => {
    const now = Date.now();
    if (deltaTickerCache && now - deltaTickerCacheTime < DELTA_CACHE_DURATION) {
      log.delta("Tickers served from cache", { age: `${Math.round((now - deltaTickerCacheTime) / 1000)}s` });
      return res.json(deltaTickerCache);
    }
    try {
      log.delta("Fetching tickers from Delta Exchange...");
      const tickers = await delta.getTickers();
      deltaTickerCache = tickers;
      deltaTickerCacheTime = now;
      log.delta("Tickers fetched", { count: Array.isArray(tickers) ? tickers.length : 0 });
      res.json(tickers);
    } catch (err: any) {
      log.error("Delta tickers error", { error: err.message });
      res.json(deltaTickerCache || []);
    }
  });

  // Single ticker
  app.get("/api/delta/ticker/:symbol", async (req, res) => {
    log.delta("Fetching ticker", { symbol: req.params.symbol });
    try {
      const ticker = await delta.getTicker(req.params.symbol);
      if (!ticker) {
        log.warn("Ticker not found", { symbol: req.params.symbol });
        return res.status(404).json({ error: "Ticker not found" });
      }
      res.json(ticker);
    } catch (err: any) {
      log.error("Delta ticker error", { symbol: req.params.symbol, error: err.message });
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Delta products (trading pairs)
  app.get("/api/delta/products", async (_req, res) => {
    const now = Date.now();
    if (deltaProductCache && now - deltaProductCacheTime < CACHE_DURATION) {
      log.delta("Products served from cache", { age: `${Math.round((now - deltaProductCacheTime) / 1000)}s` });
      return res.json(deltaProductCache);
    }
    try {
      log.delta("Fetching products from Delta Exchange...");
      const products = await delta.getProducts();
      deltaProductCache = products;
      deltaProductCacheTime = now;
      log.delta("Products fetched", { count: Array.isArray(products) ? products.length : 0 });
      res.json(products);
    } catch (err: any) {
      log.error("Delta products error", { error: err.message });
      res.json(deltaProductCache || []);
    }
  });

  // Historical candles for charts
  app.get("/api/delta/candles/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const resolution = (req.query.resolution as string) || "1h";
    const start = req.query.start ? Number(req.query.start) : undefined;
    const end = req.query.end ? Number(req.query.end) : undefined;
    log.delta("Fetching candles", { symbol, resolution });
    try {
      const candles = await delta.getHistoricalPrices(symbol, resolution, start, end);
      log.delta("Candles fetched", { symbol, count: Array.isArray(candles) ? candles.length : 0 });
      res.json(candles);
    } catch (err: any) {
      log.error("Delta candles error", { symbol, error: err.message });
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Order book
  app.get("/api/delta/orderbook/:productId", async (req, res) => {
    const productId = Number(req.params.productId);
    log.delta("Fetching orderbook", { productId });
    if (!Number.isFinite(productId) || productId <= 0) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    try {
      const book = await delta.getOrderBook(productId);
      log.delta("Orderbook fetched", { productId });
      res.json(book);
    } catch (err: any) {
      log.error("Delta orderbook error", { productId, error: err.message });
      res.status(err.status || 500).json({ error: err.message, kind: err.kind });
    }
  });

  // Place order (authenticated)
  app.post("/api/delta/orders", async (req, res) => {
    const { product_id, side, size, order_type, limit_price, stop_price, stop_order_type } = req.body;
    log.delta("Placing order", { product_id, side, size, order_type });

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
      log.delta("Order placed successfully", { product_id, side, size, orderId: order?.id });
      res.json(order);
    } catch (err: any) {
      log.error("Delta place order error", { product_id, side, size, error: err.message });
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get positions (authenticated)
  app.get("/api/delta/positions", async (_req, res) => {
    log.delta("Fetching positions");
    try {
      const positions = await delta.getPositions();
      log.delta("Positions fetched", { count: Array.isArray(positions) ? positions.length : 0 });
      res.json(positions);
    } catch (err: any) {
      log.error("Delta positions error", { error: err.message });
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get open orders (authenticated)
  app.get("/api/delta/orders", async (req, res) => {
    const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
    log.delta("Fetching open orders", { productId });
    try {
      const orders = await delta.getOpenOrders(productId);
      log.delta("Open orders fetched", { count: Array.isArray(orders) ? orders.length : 0 });
      res.json(orders);
    } catch (err: any) {
      log.error("Delta open orders error", { error: err.message });
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Get trade history / fills (authenticated)
  app.get("/api/delta/fills", async (req, res) => {
    const productId = req.query.product_id ? Number(req.query.product_id) : undefined;
    log.delta("Fetching trade fills", { productId });
    try {
      const fills = await delta.getTradeHistory(productId);
      log.delta("Fills fetched", { count: Array.isArray(fills) ? fills.length : 0 });
      res.json(fills);
    } catch (err: any) {
      log.error("Delta fills error", { error: err.message });
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Cancel order (authenticated)
  app.delete("/api/delta/orders", async (req, res) => {
    const { id, product_id } = req.body;
    log.delta("Cancelling order", { orderId: id, product_id });
    if (!id || !product_id) {
      return res.status(400).json({ error: "id and product_id required" });
    }
    try {
      await delta.cancelOrder(id, product_id);
      log.delta("Order cancelled", { orderId: id, product_id });
      res.json({ success: true });
    } catch (err: any) {
      log.error("Delta cancel order error", { orderId: id, error: err.message });
      const status = err.status && err.status > 0 ? err.status : 500;
      res.status(status).json({ error: err.message, kind: err.kind });
    }
  });

  // Delta wallet / balances (authenticated)
  app.get("/api/delta/wallet", async (_req, res) => {
    log.delta("Fetching wallet");
    try {
      const wallet = await delta.getPortfolio();
      log.delta("Wallet fetched");
      res.json(wallet);
    } catch (err: any) {
      log.error("Delta wallet error", { error: err.message });
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

  log.info("Setting up Vite middleware...");

  app.listen(PORT, "0.0.0.0", () => {
    log.success(`Server running on http://localhost:${PORT}`, {
      deltaConfigured: delta.isDeltaConfigured(),
      env: process.env.NODE_ENV || "development",
    });
  });
}

startServer();