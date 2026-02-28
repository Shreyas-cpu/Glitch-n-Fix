# Nexus Terminal — Crypto Market Dashboard

A real-time cryptocurrency market dashboard built with **React 18**, **TypeScript**, **Vite**, **Express**, and **TanStack React Query**. Features live CoinGecko data, **Delta Exchange API** integration for professional-grade trading data, a full **buy/sell trading** system with **Stop Loss / Take Profit**, two-step trade confirmations, toast notifications, portfolio management, watchlist CRUD, trending assets view, sector heatmap, activity feed, dark/light theme, and settings panel.

Built for **Glitch & Fix 2026 Hackathon** — Web3 / Blockchain Track.

---

## Core Functionality

| Feature | Description |
|---------|-------------|
| **Dashboard** | Live market data (30s polling) with price charts, computed stats, sortable table, and coin selection |
| **Delta Exchange API** | Professional-grade trading data via HMAC-SHA256 authenticated REST API — tickers, candles, orderbook, wallet |
| **Buy / Sell Trading** | Full end-to-end trading — click "Trade" on any coin, enter amount, execute buy or sell at live price |
| **Trade Confirmations** | Two-step confirmation to prevent accidental trades — click Trade → review details → confirm to execute |
| **Toast Notifications** | Real-time feedback for trades, errors, and SL/TP triggers — animated, color-coded, auto-dismissing |
| **Stop Loss / Take Profit** | Set SL/TP on any buy — auto-sells when price hits your target, with toast notifications |
| **Portfolio** | Tracks holdings with live P&L, avg cost basis, current value, SL/TP levels, and 24h change |
| **Watchlist** | Add/remove coins; click a watchlist item to view its chart |
| **Transaction History** | Complete log of all buy/sell trades with full timestamps, trigger type (manual/SL/TP), and P&L |
| **Trending** | Real gainers/losers derived from market data, sector heatmap, trending tokens by volume |
| **Activity** | Real order history with buy/sell filters and time-range filtering |
| **Settings** | Dark / Light / System theme toggle, wallet config, slippage, gas priority |
| **Real-Time** | 30-second data refresh, SL/TP monitoring loop, refetch on window focus |
| **Error Handling** | Classified error types (auth/rate-limit/network/server/unknown) with user-friendly messages |

### How Buy/Sell Works

1. On the **Dashboard**, each coin row has a **Trade** button
2. Clicking it opens a modal where you can toggle between **Buy** and **Sell**
3. Enter the amount — the total cost/revenue is calculated at the current live price
4. For sells, a "Max" button lets you sell your entire holding
5. **Optionally** expand the "Set Stop Loss / Take Profit" section (buy mode) to configure automatic triggers
6. Click the Buy/Sell button → a **confirmation banner** appears showing the trade summary
7. Click **Confirm** to execute, or **Cancel** to go back — prevents accidental trades
8. A **toast notification** appears confirming the trade was executed (or showing the error)
9. The server validates all inputs, updates the portfolio, records the transaction, and calculates P&L
10. The **Portfolio** tab shows holdings enriched with live prices, SL/TP levels, and real-time profit/loss

### How Stop Loss / Take Profit Works

1. When buying, expand the SL/TP section in the Trade Modal
2. Enter a stop loss price (below current) and/or take profit price (above current)
3. Percentage distance from current price is shown in real-time
4. The Dashboard runs a background monitoring loop every 30 seconds
5. If the market price hits your SL or TP, the position is automatically sold
6. Triggered trades appear in Activity with a **SL** or **TP** badge

### Delta Exchange Integration

The app integrates with the **Delta Exchange API** for professional-grade trading data:

- **Tickers**: Real-time price tickers for all Delta Exchange products (30s cache)
- **Candles**: Historical OHLCV data for price charts with configurable resolution
- **Order Book**: Live order book depth for any product
- **Products**: Full product catalog with 60s cache
- **Wallet**: Account balance and margin information
- **Positions**: Open positions tracking
- **Orders**: Place and cancel orders, view open orders
- **Trade History**: Full fill history

Authentication uses **HMAC-SHA256 signing** — the server proxies all Delta requests so API keys are never exposed to the browser.

### Trade Confirmation & Notifications

- **Two-Step Confirmation**: Clicking Buy/Sell shows a yellow confirmation banner with trade details. Must click Confirm to execute.
- **Toast Notifications**: Animated notifications appear top-right for:
  - ✅ Successful trades (green)
  - ❌ Failed trades with error details (red)
  - ⚠️ Stop Loss triggered (yellow)
  - ✅ Take Profit triggered (green)
- Toasts auto-dismiss after 5 seconds, max 5 visible at once

### Error Handling

Errors are classified into categories for appropriate user feedback:

| Kind | Description |
|------|-------------|
| `auth` | Invalid API key or signature (HTTP 401/403) |
| `rate-limit` | Too many requests (HTTP 429) |
| `not-found` | Resource not found (HTTP 404) |
| `network` | Connection failure or timeout |
| `server` | Server error (HTTP 5xx) |
| `unknown` | Unclassified error |

### Interactive Features

- **Sector Heatmap**: Click any sector to explore, color-coded by 24h performance
- **Gainers/Losers Grid**: Click to view coin's chart, or trade directly with the Trade button
- **Trending Table**: Sortable by volume or sentiment, click to navigate or trade
- **Watchlist**: Click any item to focus the chart on that coin
- **Theme**: Switch between Dark, Light, and System themes from Settings

---

## User Manual

### Getting Started

1. **Install & Run**: `npm install && npx tsx server.ts` → Open http://localhost:3000
2. **Browse Market**: The Dashboard shows live prices for top 25 cryptocurrencies
3. **View a Chart**: Click any coin row to see its 7-day sparkline chart
4. **Search**: Use the search bar to filter coins by name or symbol

### Trading

1. Click **Trade** on any coin in the Market Table, Trending, or Gainers/Losers view
2. Select **Buy** or **Sell** tab
3. Enter the amount you want to trade
4. (Optional) Expand **Stop Loss / Take Profit** to set automatic triggers
5. Click **Buy** or **Sell** — a confirmation banner appears
6. Review the trade details, then click **Confirm** (or **Cancel** to go back)
7. A toast notification confirms the trade
8. Check **Portfolio** tab to see your holdings and P&L

### Watchlist

1. Click the **+** button on any coin row to add it to your watchlist
2. View your watchlist in the right sidebar
3. Click a watchlist item to view its chart
4. Click the trash icon to remove

### Theme Switching

1. Go to **Settings** tab
2. Under **Appearance**, select Dark, Light, or System
3. Theme persists across sessions via localStorage

### Activity / Order History

1. Go to the **Activity** tab
2. Filter by trade type (All / Buys / Sells) and time range (1h / 24h / 7d)
3. Stats show total trades, volume, and buy/sell ratio
4. Trades triggered by Stop Loss or Take Profit show a yellow badge

---

## Getting Started (Developer)

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your **Delta Exchange API** credentials:

```env
DELTA_API_KEY=your_api_key_here
DELTA_API_SECRET=your_api_secret_here
DELTA_API_BASE_URL=https://api.delta.exchange
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

> **Note:** New Delta API keys take ~5 minutes to become operational after creation.

### Run Development Server

```bash
npx tsx server.ts
```

Open http://localhost:3000

### Run Tests

```bash
npm test
```

### Type Check (Lint)

```bash
npm run lint
```

### Production Build

```bash
npm run build
NODE_ENV=production npx tsx server.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market` | Fetch top 25 coins from CoinGecko (60s server cache) |
| GET | `/api/watchlist` | Get watchlist items |
| POST | `/api/watchlist` | Add item to watchlist |
| DELETE | `/api/watchlist/:id` | Remove from watchlist |
| GET | `/api/portfolio` | Get portfolio holdings |
| POST | `/api/portfolio/buy` | Buy a coin (params: coinId, symbol, name, amount, pricePerUnit) |
| POST | `/api/portfolio/sell` | Sell a coin (params: coinId, amount, pricePerUnit) |
| POST | `/api/portfolio/sltp` | Set Stop Loss / Take Profit on a holding |
| POST | `/api/portfolio/check-sltp` | Check if any SL/TP triggers hit against current prices |
| GET | `/api/transactions` | Get all trade transactions |

### Delta Exchange API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delta/status` | Check if Delta API is configured and reachable |
| GET | `/api/delta/tickers` | Get all tickers (30s cache) |
| GET | `/api/delta/ticker/:symbol` | Get ticker for a specific symbol |
| GET | `/api/delta/products` | Get all products/instruments (60s cache) |
| GET | `/api/delta/candles/:symbol` | Get OHLCV candles (query: resolution, start, end) |
| GET | `/api/delta/orderbook/:productId` | Get order book for a product |
| POST | `/api/delta/orders` | Place an order (body: product_id, size, side, order_type, limit_price?) |
| GET | `/api/delta/positions` | Get open positions |
| GET | `/api/delta/orders` | Get open orders (query: product_id?) |
| GET | `/api/delta/fills` | Get trade fill history (query: product_id?) |
| GET | `/api/delta/wallet` | Get wallet/balance info |
| DELETE | `/api/delta/orders` | Cancel an order (body: id, product_id) |

---

## Project Structure

```
├── server.ts              # Express backend (CoinGecko proxy, Delta API proxy, portfolio, SL/TP)
├── vite.config.ts         # Vite build configuration with Vitest test config
├── tsconfig.json          # TypeScript compiler config
├── data.json              # JSON file database (watchlist + portfolio + transactions persistence)
├── index.html             # HTML entry point
├── .env.example           # Environment variable template (Delta API + CoinGecko)
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with ThemeProvider + QueryClientProvider + ToastProvider
│   ├── index.css          # Tailwind CSS v4 + global styles + light mode overrides
│   ├── types/market.ts    # Interfaces (Coin, WatchlistItem, PortfolioHolding, TradeTransaction, SLTPConfig)
│   ├── lib/
│   │   └── deltaClient.ts      # Delta Exchange REST API client with HMAC-SHA256 signing
│   ├── hooks/
│   │   ├── useMarketData.ts    # React Query hook for market data (30s polling)
│   │   ├── useWatchlist.ts     # React Query hook for watchlist CRUD
│   │   ├── usePortfolio.ts     # React Query hook for portfolio buy/sell/SL-TP/transactions
│   │   ├── useDelta.ts         # React Query hooks for Delta API (status, tickers, candles)
│   │   ├── useToast.tsx        # Toast notification provider + hook (success/error/warning/info)
│   │   └── useTheme.tsx        # ThemeProvider context (Dark/Light/System)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Dashboard.tsx   # Main orchestrator — real stats, SL/TP monitor, all views
│   │   │   ├── Header.tsx      # Top bar with search and wallet connect
│   │   │   └── Sidebar.tsx     # Navigation sidebar (Dashboard, Portfolio, Activity, Trending, Settings)
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── MarketTable.tsx       # Sortable market table with Trade buttons
│   │   │   ├── TradeModal.tsx        # Buy/Sell modal with SL/TP, 2-step confirmation, toast feedback
│   │   │   ├── WatchlistSidebar.tsx  # Clickable watchlist items + remove
│   │   │   ├── GainersLosersGrid.tsx # Interactive gainers/losers with Trade
│   │   │   ├── LiveFeedSidebar.tsx
│   │   │   ├── SectorHeatmap.tsx     # Interactive heatmap with click/selection
│   │   │   ├── SettingsComponents.tsx
│   │   │   ├── TransactionTable.tsx
│   │   │   └── TrendingTable.tsx     # Interactive rows with Trade buttons
│   │   └── views/
│   │       ├── ActivityView.tsx      # Real order history from trade data
│   │       ├── PortfolioView.tsx     # Holdings + SL/TP levels + full timestamps
│   │       ├── SettingsView.tsx      # Theme toggle + settings
│   │       └── TrendingView.tsx      # Real gainers/losers/sectors from market data
│   └── __tests__/
│       ├── setup.ts           # Test setup (jest-dom)
│       ├── market.test.ts     # Type correctness tests (6 tests)
│       ├── portfolio.test.ts  # Buy/sell/watchlist API flow tests (13 tests)
│       └── security.test.ts   # Input validation & security tests (21 tests)
```

---

## Bugs Found & Fixed (Change Log)

| # | Severity | Bug | File | Fix |
|---|----------|-----|------|-----|
| 1 | **Critical** | `package.json` was corrupted / contained misleading text instead of valid JSON | package.json | Completely rewritten with correct dependencies |
| 2 | **Critical** | Vite config named `URMAMA.ts` with wrong imports (`vibe`, `@tailwindercss/vite`, `plugin-reaction`) | vite.config.ts | Renamed to `vite.config.ts`, fixed all imports |
| 3 | **Critical** | `tsconfig.json` was empty | tsconfig.json | Added full TypeScript config for React/Vite |
| 4 | **Critical** | `data.json` contained leaked `GEMINI_API_KEY` | data.json | Replaced with proper JSON DB structure |
| 5 | **Critical** | `market.ts` exported `Cain`/`Able` instead of `Coin`/`WatchlistItem` | src/types/market.ts | Fixed type names, added `PortfolioHolding`, `TradeTransaction`, `SLTPConfig` |
| 6 | **Critical** | `server.ts` used `vite.middlewores` (typo) | server.ts | Fixed to `vite.middlewares` |
| 7 | **High** | **No buy/sell trading functionality** — core feature entirely missing | Multiple files | Added complete buy/sell flow: server endpoints, TradeModal, PortfolioView, usePortfolio hook |
| 8 | **High** | **No portfolio management** — `data.json` had `portfolio: []` but no UI/API | Multiple files | Built full portfolio view with live P&L enrichment |
| 9 | **High** | **No Stop Loss / Take Profit** — no SL/TP feature at all | server.ts, TradeModal, usePortfolio, types | End-to-end SL/TP: server endpoints, modal UI, background monitoring, trigger badges |
| 10 | **High** | Trending/Gainers/Losers used hardcoded mock data | TrendingView.tsx | Derived from real CoinGecko market data |
| 11 | **High** | Activity view used random mock transactions | ActivityView.tsx | Wired to real trade history from usePortfolio |
| 12 | **High** | No theme switching — always dark mode | Multiple files | Added ThemeProvider (Dark/Light/System) with CSS overrides |
| 13 | **High** | Empty hook files (`useMarketData.ts`, `useWatchlist.ts`) | src/hooks/ | Implemented with React Query + 30s polling |
| 14 | **High** | No real-time data refresh — 5 min stale time | useMarketData, Dashboard | Changed to 30s polling + refetch on window focus |
| 15 | **High** | Dashboard stats hardcoded ("$2.48T", "$84.2B", "52.4%") | Dashboard.tsx | Computed from real market data |
| 16 | **High** | Chart gradient ID collision when switching coins | Dashboard.tsx | Made unique per selectedCoinId |
| 17 | **Medium** | Watchlist items not clickable — couldn't select coin for chart | WatchlistSidebar, Dashboard | Added onItemClick → setSelectedCoinId |
| 18 | **Medium** | Timestamps showed date only, no time | PortfolioView.tsx | Changed to toLocaleString() for full date+time |
| 19 | **Medium** | Empty dead file `DashboardLayout.tsx` | src/components/ui/ | Removed |
| 20 | **Medium** | `index.css` imported wrong Tailwind package | src/index.css | Fixed to `tailwindcss` v4 |
| 21 | **Medium** | 13+ components had wrong imports, garbage code | All UI files | Complete rewrite of all components |
| 22 | **Medium** | `.env.example` contained JSON data (swapped with data.json) | .env.example | Restored proper env template |
| 23 | **Medium** | No tests at all | src/__tests__/ | Added 40 tests across 3 test files |
| 24 | **Security** | API key leaked in `data.json` | data.json, .gitignore | Removed key, `.gitignore` updated |
| 25 | **Security** | No input validation on API endpoints | server.ts | Added type checks, sanitization, length limits, NaN/Infinity guards |
| 26 | **Security** | No bounds checking on amounts (could send negative or infinite values) | server.ts | Added `Number.isFinite()` checks and upper bounds |
| 27 | **High** | No trade confirmation — accidental clicks could execute trades | TradeModal.tsx | Added 2-step confirmation: click → review → confirm |
| 28 | **High** | No user feedback on trade execution (silent success/failure) | Multiple files | Added toast notification system with 4 severity levels |
| 29 | **High** | No SL/TP trigger notifications — user unaware of auto-sells | Dashboard.tsx | Added toast alerts when Stop Loss or Take Profit triggers fire |
| 30 | **High** | CoinGecko only returned 10 coins, limiting market coverage | server.ts | Increased `per_page` from 10 to 25 |
| 31 | **Feature** | No professional trading data integration | Multiple files | Added Delta Exchange API with HMAC-SHA256 auth (13 endpoints) |
| 32 | **Feature** | No error classification — generic error messages everywhere | deltaClient.ts | Added `DeltaApiError` with kind classification (auth/rate-limit/network/server) |

---

## Security Measures

- **No secrets committed** — `.env` and `.env.*` excluded via `.gitignore`
- **Server-side API proxy** — CoinGecko and Delta Exchange API calls go through Express, no API keys exposed to the browser
- **HMAC-SHA256 signing** — Delta Exchange requests are signed server-side with timestamp-based authentication
- **Input sanitization** — All POST endpoints validate types, trim whitespace, enforce length limits
- **NaN/Infinity guards** — `Number.isFinite()` checks on all numeric inputs
- **Insufficient balance check** — Sell endpoint verifies the user holds enough before executing
- **Error handling** — `try/catch` around all async operations; loading/error states in UI
- **Cache layer** — 60-second server-side cache prevents CoinGecko API rate limiting
- **Transaction limits** — Max 100 transactions stored to prevent unbounded growth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4, Framer Motion |
| State | TanStack React Query |
| Backend | Express, tsx |
| Data | JSON file database |
| Market API | CoinGecko REST API |
| Trading API | Delta Exchange REST API (HMAC-SHA256) |
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Vitest, Testing Library |
