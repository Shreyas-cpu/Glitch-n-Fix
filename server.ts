import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
let marketCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --------------------------
  // DATABASE HELPERS
  // --------------------------

  const readDB = async () => {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data);
    } catch {
      return { watchlist: [], portfolio: [] };
    }
  };

  const writeDB = async (data: any) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  };

  // --------------------------
  // MARKET PROXY (FIXES CORS)
  // --------------------------

  app.get("/api/market", async (req, res) => {
    const now =  Date.now();

    if (marketCache && now - lastFetchTime < CACHE_DURATION) {
      return res.json(marketCache);
    }

    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true"
      );

      if (!response.ok) {
        return res.status(response.status).json({
          error: "CoinGecko API failed",
        });
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

  // --------------------------
  // WATCHLIST ROUTES
  // --------------------------

  app.get("/api/watchlist", async (req, res) => {
    const db = await readDB();
    res.json(db.watchlist);
  });

  app.post("/api/watchlist", async (req, res) => {
    const { item } = req.body;

    if (!item || !item.id || !item.name || !item.symbol) {
      return res.status(400).json({ error: "Invalid watchlist item" });
    }

    const db = await readDB();

    if (!db.watchlist.find((i: any) => i.id === item.id)) {
      db.watchlist.push(item);
      await writeDB(db);
    }

    res.json(db.watchlist);
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    const { id } = req.params;
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

    app.use(vite.middlewores);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();