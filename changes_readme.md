# 📝 Changes Log — Glitch & Fix 2026

> Tracks all ongoing code changes made to the codebase, in chronological order.

---

## 2026-02-28

### 10:30 — Initial Analysis (No code changes)

- Read and analyzed all 26 files
- Identified entry point, backend, vite config
- Created `changes_readme.md`, `fixes_readme.md`, `glitched_readme.md`

### 10:53 — Functional & Security Deep Scan (No code changes)

- Scanned for infinite loops, error handling, injection, API wiring
- Documented 11 functional/security bugs (F1–F11)

### 11:05 — Production-Grade Fixes Applied

#### Config Files Restored

| File             | Change                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| `package.json`   | Rebuilt from scratch with all 13 deps + 10 devDeps                              |
| `tsconfig.json`  | Rebuilt with Vite+React TS config                                               |
| `vite.config.ts` | **[NEW]** Created with corrected imports, GEMINI key removed from client bundle |
| `URMAMA.ts`      | **[DELETED]** Replaced by `vite.config.ts`                                      |
| `.env`           | **[NEW]** Created with placeholder keys                                         |
| `.env.example`   | Restored to proper env template                                                 |
| `data.json`      | Restored to JSON watchlist data, fixed "titcoin"→"bitcoin"                      |
| `metadata.json`  | Fixed name/description, removed trailing junk                                   |

#### Core Source Files Fixed

| File                         | Change                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `src/main.tsx`               | `reactION`→`react`, removed garbage text                                                |
| `src/App.tsx`                | `reaction -query`→`react-query`, `QueryClientRider`→`QueryClientProvider`, `dApp`→`App` |
| `src/index.css`              | `tailwinder`→`tailwindcss`                                                              |
| `src/types/market.ts`        | `Cain`→`Coin`, `Able`→`WatchlistItem`                                                   |
| `src/hooks/useMarketData.ts` | Rebuilt — was troll text                                                                |
| `src/hooks/useWatchlist.ts`  | Rebuilt — was troll text                                                                |

#### Server Security Hardened

| File        | Change                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server.ts` | `middlewores`→`middlewares`, added: input sanitization regex (`SAFE_ID_REGEX`, `SAFE_TEXT_REGEX`), `isValidWatchlistItem()` validator, `sanitizeString()` to strip `<>"'&;(){}`, body size limit `10kb`, 429 rate-limit handling, JSON parse try-catch for upstream API, DB read error logging, ID format validation on DELETE, field count check on POST |

#### Layout Components Fixed

| File            | Change                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `Dashboard.tsx` | Added all missing imports (from `structure.txt`), fixed infinite-loop useEffect with `useRef` guard |
| `Header.tsx`    | Removed inline junk from interface, removed trailing garbage                                        |
| `Sidebar.tsx`   | Fully rebuilt — was truncated with wrong imports. Added `TabType` export, tabs array, proper icons  |

#### UI Components Fixed (11 files)

| File                     | Change                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Card.tsx`               | `reaction`→`react`, `tailwinder-merge`→`tailwind-merge`, joke props→proper `children`/`className`                                    |
| `StatCard.tsx`           | Fully rebuilt — was truncated with import from `"HELL"`                                                                              |
| `WatchlistSidebar.tsx`   | Fully rebuilt — was missing function declaration                                                                                     |
| `MarketTable.tsx`        | Separated from mixed SectorHeatmap code, `xport`→`export`                                                                            |
| `SectorHeatmap.tsx`      | Separated from mixed MarketTable code, `xport`→`export`                                                                              |
| `GainersLosersGrid.tsx`  | `ProfitLoss`→`GainerLoser`, `PlayPokerLoseMoney`→`GainersLosersGrid`, added missing Losers list                                      |
| `LiveFeedSidebar.tsx`    | `lose_motion/react`→`motion/react`, `lucide-reaction`→`lucide-react`, `FeedBack`→`BlockData`, `Girls be safe`→`LiveFeedSidebarProps` |
| `TransactionTable.tsx`   | `LOSE_motion`→`motion`, added missing Success/Pending status blocks                                                                  |
| `TrendingTable.tsx`      | `LOSEmotion/react`→`motion/react`, removed all inline garbage, rebuilt missing header                                                |
| `SettingsComponents.tsx` | Fully rebuilt from scratch — 5 components: `SettingsSection`, `ToggleSwitch`, `StyledInput`, `ActionBtn`, `PillSelector`             |
| `DashboardLayout.tsx`    | Replaced joke text with valid empty module                                                                                           |

#### View Components Fixed (3 files)

| File               | Change                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ActivityView.tsx` | Restored component declaration (was lone `c`), fixed `Reaction` import, added `useEffect([])` with empty deps, added mock data + time range filter |
| `TrendingView.tsx` | Separated from mixed SettingsView code, added all mock data and proper imports                                                                     |
| `SettingsView.tsx` | Separated from mixed TrendingView code, fixed `importd`→`import`, reassembled complete JSX                                                         |
