import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

// --- Security: Input sanitization ---
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,100}$/;
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9 ._-]{1,200}$/;

function sanitizeString(input: unknown): string | null {
  if (typeof input !== "string") return null;
  return input
    .replace(/[<>"'&;(){}]/g, "")
    .trim()
    .substring(0, 200);
}

function isValidWatchlistItem(
  item: any,
): item is { id: string; symbol: string; name: string } {
  return (
    item &&
    typeof item.id === "string" &&
    SAFE_ID_REGEX.test(item.id) &&
    typeof item.symbol === "string" &&
    SAFE_TEXT_REGEX.test(item.symbol) &&
    typeof item.name === "string" &&
    SAFE_TEXT_REGEX.test(item.name) &&
    Object.keys(item).length <= 3
  );
}

// --- Cache ---
let marketCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10kb" }));

  // --------------------------
  // DATABASE HELPERS
  // --------------------------

  const readDB = async () => {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.watchlist || !Array.isArray(parsed.watchlist)) {
        console.warn("DB missing watchlist array, resetting.");
        return { watchlist: [], portfolio: [] };
      }
      return parsed;
    } catch (err) {
      console.error("Failed to read DB, returning defaults:", err);
      return { watchlist: [], portfolio: [] };
    }
  };

  const writeDB = async (data: any) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  };

  // --------------------------
  // MARKET PROXY (FIXES CORS)
  // --------------------------

  app.get("/api/market", async (_req, res) => {
    const now = Date.now();

    if (marketCache && now - lastFetchTime < CACHE_DURATION) {
      return res.json(marketCache);
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true",
      );

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          console.warn("CoinGecko rate limit hit");
          return res
            .status(429)
            .json({ error: "Rate limited — try again shortly" });
        }
        return res
          .status(status)
          .json({ error: `CoinGecko API returned ${status}` });
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        return res
          .status(502)
          .json({ error: "Invalid JSON from upstream API" });
      }

      if (!Array.isArray(data)) {
        return res
          .status(502)
          .json({ error: "Unexpected response format from CoinGecko" });
      }

      marketCache = data;
      lastFetchTime = now;
      res.json(data);
    } catch (error) {
      console.error("Market fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // --------------------------
  // WATCHLIST ROUTES
  // --------------------------

  app.get("/api/watchlist", async (_req, res) => {
    const db = await readDB();
    res.json(db.watchlist);
  });

  app.post("/api/watchlist", async (req, res) => {
    const { item } = req.body;

    if (!isValidWatchlistItem(item)) {
      return res
        .status(400)
        .json({
          error:
            "Invalid watchlist item — requires id, symbol, name (alphanumeric only)",
        });
    }

    const safeItem = {
      id: sanitizeString(item.id)!,
      symbol: sanitizeString(item.symbol)!,
      name: sanitizeString(item.name)!,
    };

    const db = await readDB();

    if (!db.watchlist.find((i: any) => i.id === safeItem.id)) {
      db.watchlist.push(safeItem);
      await writeDB(db);
    }

    res.json(db.watchlist);
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    const { id } = req.params;

    if (!SAFE_ID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const db = await readDB();
    db.watchlist = db.watchlist.filter((i: any) => i.id !== id);
    await writeDB(db);

    res.json(db.watchlist);
  });

  // --------------------------
  // DEV / PROD HANDLING
  // --------------------------

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
