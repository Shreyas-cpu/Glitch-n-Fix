# Nexus Terminal — Crypto Market Dashboard

A real-time cryptocurrency market dashboard built with **React 18**, **TypeScript**, **Vite**, **Express**, and **TanStack React Query**. Features live CoinGecko data, a full **buy/sell trading** system with portfolio management, watchlist CRUD, trending assets view, sector heatmap, activity feed, and settings panel.

Built for **Glitch & Fix 2026 Hackathon** — Web3 / Blockchain Track.

---

## Core Functionality

| Feature | Description |
|---------|-------------|
| **Dashboard** | Live market data with price charts, sortable table, and coin selection |
| **Buy / Sell Trading** | Full end-to-end trading flow — click "Trade" on any coin, enter amount, execute buy or sell with real price data |
| **Portfolio** | Tracks all holdings with live P&L, average cost basis, and current value enriched from live market prices |
| **Watchlist** | Add/remove coins to a persistent watchlist stored server-side |
| **Transaction History** | Complete log of all buy/sell trades with timestamps and P&L |
| **Trending** | Top gainers/losers, sector heatmap, trending tokens with sparkline charts |
| **Activity** | Simulated blockchain transactions and live network feed |
| **Settings** | Wallet config, slippage, gas priority, security, and appearance |

### How Buy/Sell Works

1. On the **Dashboard**, each coin row has a **Trade** button
2. Clicking it opens a modal where you can toggle between **Buy** and **Sell**
3. Enter the amount — the total cost/revenue is calculated at the current live price
4. For sells, a "Max" button lets you sell your entire holding
5. The server validates all inputs, updates the portfolio, records the transaction, and calculates P&L
6. The **Portfolio** tab shows your holdings enriched with live prices and real-time profit/loss

---

## Getting Started

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

## Project Structure

```
├── server.ts              # Express backend (CoinGecko proxy, watchlist CRUD, portfolio buy/sell, transactions)
├── vite.config.ts         # Vite build configuration with Vitest test config
├── tsconfig.json          # TypeScript compiler config
├── data.json              # JSON file database (watchlist + portfolio + transactions persistence)
├── index.html             # HTML entry point
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with React Query provider
│   ├── index.css          # Tailwind CSS v4 + global styles
│   ├── types/market.ts    # TypeScript interfaces (Coin, WatchlistItem, PortfolioHolding, TradeTransaction)
│   ├── hooks/
│   │   ├── useMarketData.ts    # React Query hook for market data
│   │   ├── useWatchlist.ts     # React Query hook for watchlist CRUD
│   │   └── usePortfolio.ts     # React Query hook for portfolio buy/sell/transactions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Dashboard.tsx   # Main dashboard orchestrator with all views
│   │   │   ├── Header.tsx      # Top bar with search and wallet connect
│   │   │   └── Sidebar.tsx     # Navigation sidebar
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── MarketTable.tsx       # Sortable market table with Trade buttons
│   │   │   ├── TradeModal.tsx        # Buy/Sell modal with validation, status, and P&L
│   │   │   ├── WatchlistSidebar.tsx
│   │   │   ├── GainersLosersGrid.tsx
│   │   │   ├── LiveFeedSidebar.tsx
│   │   │   ├── SectorHeatmap.tsx
│   │   │   ├── SettingsComponents.tsx
│   │   │   ├── TransactionTable.tsx
│   │   │   └── TrendingTable.tsx
│   │   └── views/
│   │       ├── ActivityView.tsx
│   │       ├── PortfolioView.tsx     # Portfolio holdings + recent trades
│   │       ├── SettingsView.tsx
│   │       └── TrendingView.tsx
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
| 5 | **Critical** | `market.ts` exported `Cain`/`Able` instead of `Coin`/`WatchlistItem` | src/types/market.ts | Fixed type names, added `PortfolioHolding` and `TradeTransaction` |
| 6 | **Critical** | `server.ts` used `vite.middlewores` (typo) | server.ts | Fixed to `vite.middlewares` |
| 7 | **High** | **No buy/sell trading functionality** — core feature entirely missing | Multiple files | Added complete buy/sell flow: server endpoints, TradeModal, PortfolioView, usePortfolio hook |
| 8 | **High** | **No portfolio management** — `data.json` had `portfolio: []` but no UI/API | Multiple files | Built full portfolio view with live P&L enrichment |
| 9 | **High** | Empty hook files (`useMarketData.ts`, `useWatchlist.ts`) | src/hooks/ | Implemented with React Query |
| 10 | **High** | Empty dead file `DashboardLayout.tsx` | src/components/ui/ | Removed |
| 11 | **High** | `index.css` imported wrong Tailwind package | src/index.css | Fixed to `tailwindcss` v4 |
| 12 | **High** | 13+ components had wrong imports, garbage code | All UI files | Complete rewrite of all components |
| 13 | **Medium** | `.env.example` contained JSON data (swapped with data.json) | .env.example | Restored proper env template |
| 14 | **Medium** | No tests at all | src/__tests__/ | Added 40 tests across 3 test files |
| 15 | **Security** | API key leaked in `data.json` | data.json, .gitignore | Removed key, `.gitignore` updated |
| 16 | **Security** | No input validation on API endpoints | server.ts | Added type checks, sanitization, length limits, NaN/Infinity guards |
| 17 | **Security** | No bounds checking on amounts (could send negative or infinite values) | server.ts | Added `Number.isFinite()` checks and upper bounds |

---

## Security Measures

- **No secrets committed** — `.env` and `.env.*` excluded via `.gitignore`
- **Server-side API proxy** — CoinGecko API calls go through Express, no API keys exposed to the client
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
| Charts | Recharts |
| Icons | Lucide React |
| Testing | Vitest, Testing Library |

---

## Suggested Git Commit History

```
chore: initial broken codebase — baseline for Glitch & Fix 2026
fix(config): restore package.json, tsconfig.json, vite.config.ts
fix(types): correct Cain/Able → Coin/WatchlistItem exports
fix(server): fix middlewares typo, add try/catch to readDB
fix(components): rewrite all UI components with correct imports
feat(trade): add buy/sell endpoints with validation and P&L tracking
feat(ui): add TradeModal component for buy/sell flow
feat(portfolio): add PortfolioView with live P&L enrichment
feat(hooks): implement useMarketData, useWatchlist, usePortfolio
feat(nav): add Portfolio tab to sidebar navigation
security: add NaN/Infinity guards and input sanitization
test: add 40 tests for types, API flows, and input validation
chore: remove dead DashboardLayout.tsx, clean .gitignore
docs: update README with full documentation and fix log
```
