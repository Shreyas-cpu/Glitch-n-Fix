# Nexus Terminal — Crypto Market Dashboard

A real-time cryptocurrency market dashboard built with **React 18**, **TypeScript**, **Vite**, **Express**, and **TanStack React Query**. Fetches live data from the CoinGecko API with watchlist management, trending assets view, sector heatmap, activity feed, and settings panel.

Built for **Glitch & Fix 2026 Hackathon** — Web3 / Blockchain Track.

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

### Production Build

```bash
npm run build
NODE_ENV=production npx tsx server.ts
```

## Project Structure

```
├── server.ts              # Express backend (CoinGecko proxy, watchlist CRUD)
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript compiler config
├── data.json              # JSON file database (watchlist persistence)
├── index.html             # HTML entry point
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with React Query provider
│   ├── index.css          # Tailwind CSS + global styles
│   ├── types/market.ts    # TypeScript interfaces
│   ├── components/
│   │   ├── layout/        # Dashboard, Header, Sidebar
│   │   ├── ui/            # Card, StatCard, MarketTable, etc.
│   │   └── views/         # ActivityView, TrendingView, SettingsView
```

## Bugs Found & Fixed

| # | Severity | Bug | File | Fix |
|---|----------|-----|------|-----|
| 1 | Critical | Vite config named `URMAMA.ts` with wrong imports (`vibe`, `@tailwindercss/vite`, `plugin-reaction`) | URMAMA.ts | Renamed to `vite.config.ts`, fixed all imports |
| 2 | Critical | `tsconfig.json` empty | tsconfig.json | Added full TS config |
| 3 | Critical | `data.json` contained leaked `GEMINI_API_KEY` | data.json | Replaced with proper JSON DB |
| 4 | Critical | `main.tsx` imports from `reactION` with garbage text | src/main.tsx | Fixed imports, removed garbage |
| 5 | Critical | `App.tsx` imports `QueryClientRider` from `@tanstack/reaction -query` | src/App.tsx | Fixed to proper package/export names |
| 6 | Critical | `server.ts` uses `vite.middlewores` | server.ts | Fixed typo to `middlewares` |
| 7 | Critical | `Dashboard.tsx` has zero imports | Dashboard.tsx | Added all required imports |
| 8 | High | `index.css` imports `tailwinder` | src/index.css | Fixed to `tailwindcss` |
| 9 | High | `market.ts` exports `Cain`/`Able` instead of `Coin`/`WatchlistItem` | src/types/market.ts | Fixed type names |
| 10 | High | 13+ components have wrong imports, garbage code, offensive names | All UI files | Complete rewrite of all components |
| 11 | Medium | `.env.example` contained JSON data (swapped with data.json) | .env.example | Restored proper env template |
| 12 | Medium | `Header.tsx` missing `walletConnected` prop | Header.tsx | Added to interface |
| 13 | Security | API key leaked in `data.json` | data.json, .gitignore | Removed key, updated .gitignore |
| 14 | Security | No input validation on watchlist POST | server.ts | Added type checks, sanitization, length limits |

## Security

- No secrets committed — `.env` excluded via `.gitignore`
- Server-side API proxy — CoinGecko calls go through Express
- Input sanitization — Watchlist POST validates and trims all fields
- Error boundaries — Loading/error states in Dashboard
- Cache layer — 60s server-side cache prevents API rate limiting

export interface Cain {    // ← should be Coin
export interface Able {    // ← should be WatchlistItem