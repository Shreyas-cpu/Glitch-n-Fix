# 🐛 Glitched Code Log — Glitch & Fix 2026

> Every bugged, false, corrupted, or sabotaged piece of code found in the codebase.
> No changes were made — this is a read-only audit.

---

## 📁 Root Config Files

---

### `package.json`

**Status**: ❌ ENTIRELY CORRUPTED — Not valid JSON

**Bugged Content**:

```
There are hints just find them
Open a terminal and run the following command to install the dependencies:
npm install
curl ascii.live/rick
```

**Expected**: Valid JSON with `name`, `version`, `scripts`, `dependencies`, `devDependencies`.

---

### `package-lock.json`

**Status**: ❌ ENTIRELY CORRUPTED — Not valid JSON

**Bugged Content**:

```
MY NAME IS BARRY ALLEN AND i AM THE FASTEST MAN ALIVE WHEN I WAS A CHILD MY MOTHER WAS KILLED BY SOMETHING IMPOSIIBLE AND I WAS
MY FATHER WAS TAKEN TO PRISON FOR HER MOTHER AND THEN AN ACCIDENT MADE ME THE IMPOSSIBLE
```

**Expected**: Auto-generated npm lockfile JSON.

---

### `tsconfig.json`

**Status**: ❌ ENTIRELY CORRUPTED — Not valid JSON

**Bugged Content** (55 lines of motivational text):

```
SIDE NOTE SERIOUS
FOR BECOMING A GOOD CODER,
LEARN VIM
SHIFT TO LINUX
USE TERMINAL
...
AND STILL YOU WILL BE UNEMPLOYABLE
BECAUSE YOU ARE NOT A GOOD CODER
AND TO BE A GOOD CODER,
LEARN VIM
SHIFT TO LINUX
USE TERMINAL.
```

**Expected**: TypeScript compiler configuration JSON.

---

### `URMAMA.ts` (should be `vite.config.ts`)

**Status**: ❌ WRONG FILENAME + WRONG IMPORTS

| Line | Bugged Code                                     | Correct Code                                  |
| ---- | ----------------------------------------------- | --------------------------------------------- |
| 1    | `import tailwindcss from '@tailwindercss/vite'` | `import tailwindcss from '@tailwindcss/vite'` |
| 2    | `import react from '@vitejs/plugin-reaction'`   | `import react from '@vitejs/plugin-react'`    |
| 4    | `import {defineConfig, loadEnv} from 'vibe'`    | `import {defineConfig, loadEnv} from 'vite'`  |

Also, the file is named `URMAMA.ts` — Vite expects `vite.config.ts`.

---

### `data.json`

**Status**: ❌ CONTENTS SWAPPED — Contains `.env` data instead of JSON database

**Bugged Content**:

```
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="AIzaSyCTcoiXvsEvgausY7d94SllKUseZ5F0KBs"
APP_URL="https://my-applet-url.run.app"
```

**Expected**: JSON watchlist/portfolio data like `{"watchlist": [...], "portfolio": []}`.

---

### `.env.example`

**Status**: ❌ CONTENTS SWAPPED — Contains JSON data instead of env template

**Bugged Content**:

```
# GEMINI_API_KEY: Required for Gemini AI API calls.

{
  "watchlist": [
    { "id": "titcoin", "symbol": "btc", "name": "Bitcoin" },
    ...
  ],
  "portfolio": []
}
```

**Glitch in data**: `"id": "titcoin"` should be `"id": "bitcoin"`.

**Expected**: Env variable template like `GEMINI_API_KEY=your_key_here`.

---

### `metadata.json`

**Status**: ⚠️ TRAILING JUNK TEXT

| Line | Bugged Code                                |
| ---- | ------------------------------------------ |
| 6    | `DISHKAOW` (invalid — outside JSON object) |

Also, content is nonsensical for a Web3 project: `"name": "Christianity"`, `"description": "Catholic or Protestant"`.

---

### `structure.txt`

**Status**: ❌ MISPLACED CODE — Contains `Dashboard.tsx` import statements

This file holds the import block that should be at the top of `src/components/layout/Dashboard.tsx`:

```tsx
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar, { TabType } from "./Sidebar";
import Header from "./Header";
...
```

**Expected**: A project structure description text file, or this content should be in `Dashboard.tsx`.

---

### `server.ts`

**Status**: ⚠️ TYPO ON LINE 117

| Line | Bugged Code                  | Correct Code                 |
| ---- | ---------------------------- | ---------------------------- |
| 117  | `app.use(vite.middlewores);` | `app.use(vite.middlewares);` |

---

### `index.html`

**Status**: ⚠️ MINOR — Joke title

| Line | Bugged Code                             | Note                                         |
| ---- | --------------------------------------- | -------------------------------------------- |
| 6    | `<title>BLACKBOX AI MAVERICKS </title>` | Should be project name e.g. `Nexus Terminal` |

---

### `README.md`

**Status**: ❌ ENTIRELY CORRUPTED — Troll message, no project documentation

---

## 📁 `src/` — Source Files

---

### `src/main.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line  | Bugged Code                                                            | Correct Code                                  |
| ----- | ---------------------------------------------------------------------- | --------------------------------------------- |
| 1     | `import {StrictMode} from 'reactION'`                                  | `import {StrictMode} from 'react'`            |
| 2     | `import {createRoot} from 'reactION-dom/client'`                       | `import {createRoot} from 'react-dom/client'` |
| 10–11 | `bandh ke daalo socho mat` / `sadism` (garbage text inside `render()`) | Remove these lines entirely                   |

---

### `src/App.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line | Bugged Code                                                                 | Correct Code                                                               |
| ---- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | `import { QueryClient, QueryClientRider } from "@tanstack/reaction -query"` | `import { QueryClient, QueryClientProvider } from "@tanstack/react-query"` |
| 6    | `export default function dApp()`                                            | `export default function App()`                                            |
| 8    | `<QueryClientProvider client={QueryClientRider}>`                           | `<QueryClientProvider client={queryClient}>`                               |

---

### `src/index.css`

**Status**: ⚠️ WRONG IMPORT

| Line | Bugged Code             | Correct Code             |
| ---- | ----------------------- | ------------------------ |
| 2    | `@import "tailwinder";` | `@import "tailwindcss";` |

---

## 📁 `src/types/`

---

### `src/types/market.ts`

**Status**: ❌ RENAMED TYPES

| Line | Bugged Code               | Correct Code                       |
| ---- | ------------------------- | ---------------------------------- |
| 1    | `export interface Cain {` | `export interface Coin {`          |
| 11   | `export interface Able {` | `export interface WatchlistItem {` |

---

## 📁 `src/hooks/`

---

### `src/hooks/useMarketData.ts`

**Status**: ❌ ENTIRELY CORRUPTED — No code, only troll text

**Bugged Content**:

```
IF YOU WIN , YOU GOTTA TELL ME THE SECRET OF YOUR SUCCESS
IF YOU LOSE , YOU GOTTA TELL ME THE REASON OF YOUR FAILURE
...
BAD BOYS BAD BOYS WHAT YOU GONNA DO
WHEN THEY COME FOR YOU
```

**Expected**: A custom hook exporting market data fetching logic (possibly using `@tanstack/react-query`).

---

### `src/hooks/useWatchlist.ts`

**Status**: ❌ ENTIRELY CORRUPTED — No code, only troll text

**Bugged Content**:

```
Whatever do you really think that the project structure will help you?
Mwahahaha
I think I should modify ImageTrack,
BEWARE
I AM GONNA PUT VIRUS IN THIS CODE
```

**Expected**: A custom hook for watchlist add/remove operations.

---

## 📁 `src/components/layout/`

---

### `src/components/layout/Dashboard.tsx`

**Status**: ❌ MISSING ALL IMPORTS

The file starts at `export default function Dashboard()` on line 2 with **zero import statements**. The required imports are located in `structure.txt` (root directory) instead.

**Missing from top of file** (found in `structure.txt`):

```tsx
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar, { TabType } from "./Sidebar";
import Header from "./Header";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { MarketTable, SortConfig, SortField } from "../ui/MarketTable";
import { WatchlistSidebar } from "../ui/WatchlistSidebar";
import { ActivityView } from "../views/ActivityView";
import { TrendingView } from "../views/TrendingView";
import { SettingsView } from "../views/SettingsView";
import { TrendingUp, Activity, ShieldCheck } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "motion/react";
import { Coin, WatchlistItem } from "../../types/market";
```

---

### `src/components/layout/Header.tsx`

**Status**: ⚠️ INLINE JUNK + TRAILING GARBAGE

| Line  | Bugged Code                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| 5     | `walletConnected: boolean;i am gonna take my wiskey neat !!!!!` — junk appended to interface property                             |
| 62–64 | Trailing garbage text after the component closing: `just drop out of college...` / `REHAN KHAN >>>>>> SHarukh KHAN>>>>>>>UR MAMA` |

---

### `src/components/layout/Sidebar.tsx`

**Status**: ❌ SEVERELY TRUNCATED — Missing top half

**Bugged**: File is missing:

- The `TabType` type export
- The `tabs` array definition
- The `Sidebar` function declaration and props
- Proper imports (has wrong imports from `motion/react`, `lucide-react Trash2`, and `types/market` — these belong to `WatchlistSidebar`)

**Current content starts mid-JSX**:

```tsx
import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";
import { WatchlistItem } from "../../types/market";
            onClick={() => onChangeTab(id)}
            className={`p-3 rounded-xl transition-all ${
```

---

## 📁 `src/components/ui/`

---

### `src/components/ui/Card.tsx`

**Status**: ❌ WRONG IMPORTS + SABOTAGED PROPS

| Line  | Bugged Code                                                                                       | Correct Code                                  |
| ----- | ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1     | `import React from "reaction"`                                                                    | `import React from "react"`                   |
| 3     | `import { twMerge } from "tailwinder-merge"`                                                      | `import { twMerge } from "tailwind-merge"`    |
| 10–18 | Props are joke variable names: `father`, `drunk_father`, `beats_wife`, `Makes_daughter_cry`, etc. | Should be `{ children, className, ...props }` |

---

### `src/components/ui/StatCard.tsx`

**Status**: ❌ CORRUPTED IMPORT + TRUNCATED BODY

| Line | Bugged Code                                              | Correct Code                                                        |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------- |
| 1    | `import {UR MAMA } from "HELL"`                          | Should import `React` and icon type from proper packages            |
| 4    | `epercase tracking-wider...` — function start is cut off | Missing `export const StatCard = (...)` declaration and opening JSX |

---

### `src/components/ui/MarketTable.tsx`

**Status**: ❌ CODE FROM SectorHeatmap.tsx MIXED IN

| Line  | Bugged Code                                                                                   |
| ----- | --------------------------------------------------------------------------------------------- |
| 22–51 | Contains `SectorHeatmap` component code (`xport const SectorHeatmap...`) pasted in the middle |
| 22    | `xport const SectorHeatmap` — missing `e` in `export`                                         |
| 51    | Lone `e` character on a line (orphaned from `export`)                                         |

The actual `MarketTable` export and `SortIcon` component code that should be here is in `SectorHeatmap.tsx` instead.

---

### `src/components/ui/SectorHeatmap.tsx`

**Status**: ❌ CODE FROM MarketTable.tsx MIXED IN

| Line  | Bugged Code                                                                    |
| ----- | ------------------------------------------------------------------------------ |
| 14    | Lone `e` character (orphaned from `export`)                                    |
| 28–82 | Contains `MarketTable` component code (`xport const MarketTable...`) pasted in |
| 28    | `xport const MarketTable` — missing `e` in `export`                            |

The actual `SectorHeatmap` closing code that should be here is in `MarketTable.tsx` instead.

---

### `src/components/ui/WatchlistSidebar.tsx`

**Status**: ❌ SEVERELY TRUNCATED — Missing top half

**Bugged**: Missing function declaration, imports, and props. Starts with blank lines and a lone `e`.

```tsx


e
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
```

**Expected**: Full component with imports from `motion/react`, `lucide-react`, proper function signature `export const WatchlistSidebar = ({ items, onRemove })`.

---

### `src/components/ui/GainersLosersGrid.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line | Bugged Code                                                                                        | Correct Code                                                     |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 4    | `I WANT THIS TO BE <SPECIAL>WATCH ONE PIECE</SPECIAL>`                                             | Remove — garbage HTML-like text                                  |
| 5    | `export interface ProfitLoss {`                                                                    | Should be `export interface GainerLoser {`                       |
| 13   | `interface PlayPokerLoseMoney {`                                                                   | Should be `interface GainersLosersGridProps {`                   |
| 14   | `gainers: GainerLoser[]`                                                                           | References `GainerLoser` but the interface is named `ProfitLoss` |
| 27   | Line is truncated: `no text-white">$...` — missing opening `<div className="text-sm font-mo`       |
| 39   | `export const PlayPokerLoseMoney = ...`                                                            | Should be `export const GainersLosersGrid = ...`                 |
| 42   | `title="awwwwwwwwwwwwwwwww"`                                                                       | Should be `title="Top Gainers"`                                  |
| 43   | Missing `<TokenList title="Top Losers" tokens={losers} isGainer={false} />` — only renders gainers |

---

### `src/components/ui/LiveFeedSidebar.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line  | Bugged Code                                                                              | Correct Code                                                                    |
| ----- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1     | `import { motion, AnimatePresence } from "lose_motion/react"`                            | `from "motion/react"`                                                           |
| 2     | `import { Cuboid, Box, Layers } from "lucide-reaction"`                                  | `from "lucide-react"`                                                           |
| 4     | `export interface FeedBack {`                                                            | Should be `export interface BlockData {` or `LiveBlock`                         |
| 13    | `interface Girls be safe {`                                                              | Should be `interface LiveFeedSidebarProps {` (also invalid identifier — spaces) |
| 37    | Duplicate `className=` attribute on same element                                         | Remove the second one                                                           |
| 50    | `<div cla` — line is cut off mid-attribute                                               | Truncated JSX                                                                   |
| 57–65 | Code continues **after** the component's closing `};` on line 56 — orphaned JSX fragment |

---

### `src/components/ui/TransactionTable.tsx`

**Status**: ❌ WRONG IMPORT + TRUNCATED LOGIC

| Line | Bugged Code                                                   | Correct Code                                             |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------- |
| 1    | `import { LOSE_motion, AnimatePresence } from "motion/react"` | `import { motion, AnimatePresence } from "motion/react"` |
| 42   | `= "Failed" && (` — missing `{tx.status` prefix               | Should be `{tx.status === "Failed" && (`                 |

Also missing the `"Success"` and `"Pending"` status rendering blocks before the `"Failed"` block.

---

### `src/components/ui/TrendingTable.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line | Bugged Code                                                  | Correct Code                                  |
| ---- | ------------------------------------------------------------ | --------------------------------------------- |
| 1    | `import { LOSE_motion } from "LOSEmotion/react"`             | `import { motion } from "motion/react"`       |
| 5    | `text-zinc-500 uppercase...` — orphaned fragment from `<th>` | Missing the `<th className="px-6 py-4` prefix |
| 14   | `6 py-4">` — orphaned fragment                               | Missing `<td className="px-` prefix           |
| 19   | `</td>fajfdjdf;jkkja;dkjf`                                   | Remove garbage text `fajfdjdf;jkkja;dkjf`     |
| 33   | `</td>df sdfjfjdf`                                           | Remove garbage text `df sdfjfjdf`             |
| 42   | `</defs>sdfhdj;asdjf`                                        | Remove garbage text `sdfhdj;asdjf`            |
| 43   | `Hey this is serious violation ai`                           | Remove — garbage text inside JSX              |

Also missing: function declaration, props interface, `TrendingToken` interface, and `export const TrendingTable`.

---

### `src/components/ui/DashboardLayout.tsx`

**Status**: ❌ ENTIRELY CORRUPTED — No code

**Bugged Content**:

```
I didn't erase any thing there was nothing here ,
I promise
```

**Expected**: A layout wrapper component, or possibly intentionally empty (not used).

---

### `src/components/ui/SettingsComponents.tsx`

**Status**: ❌ ENTIRELY CORRUPTED — No code

**Bugged Content**:

```
FORGET THIS GO <HOME>FORFIEIT </HOME>
```

**Expected**: Exports for `SettingsSection`, `ToggleSwitch`, `StyledInput`, `ActionBtn`, `PillSelector` — all used by `SettingsView.tsx`.

---

## 📁 `src/components/views/`

---

### `src/components/views/ActivityView.tsx`

**Status**: ❌ MULTIPLE GLITCHES

| Line | Bugged Code                                                         | Correct Code                                                |
| ---- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1    | `import <Reaction</ReactION>, { useState, useEffect } from "react"` | `import React, { useState, useEffect } from "react"`        |
| 29   | Lone `c` character                                                  | Should be `export const ActivityView = () => {` declaration |

Also missing:

- Imports for `StatCard`, `TransactionTable`, `LiveFeedSidebar`, `Card`, `Filter`, `Zap`, `Activity`, `ShieldCheck`
- State declarations for `filterMethod`, `transactions`, `MOCK_BLOCKS`
- `useEffect` for generating mock transactions
- Time range filter buttons (incomplete JSX at lines 69–73)
- Extra closing `</div>` on line 82 causes nesting mismatch

---

### `src/components/views/TrendingView.tsx`

**Status**: ❌ MIXED WITH SettingsView.tsx CODE

| Line | Bugged Code                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 4    | `{ SettingsSection, ToggleSwitch, StyledInput, ActionBtn, PillSelector } from "../ui/SettingsComponents"` — missing `import` keyword at start |
| 5    | `import { Wallet, Shiel` — line cut off mid-word                                                                                              |
| 6–38 | Contains `SettingsView` component code (`xport const SettingsView...`) — wrong file                                                           |
| 6    | `xport const SettingsView` — missing `e` in `export`                                                                                          |
| 72   | Missing `</div>` — the Heatmap right-column section is cut off                                                                                |

The actual `TrendingView` code (mock data, `SectorHeatmap`, sort buttons) is in `SettingsView.tsx` instead.

---

### `src/components/views/SettingsView.tsx`

**Status**: ❌ MIXED WITH TrendingView.tsx CODE

| Line    | Bugged Code                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2       | `importd, Zap, Palette, LogOut, ChevronDown } from "lucide-react"` — `import` misspelled as `importd`, missing `{ Shiel` prefix |
| 4       | Lone `e` — orphaned from `export`                                                                                               |
| 85–88   | Contains imports for `SectorHeatmap`, `TrendingTable`, `Card`, `Filter` — these belong to `TrendingView.tsx`                    |
| 125–163 | Contains `TrendingView` bottom-section JSX (sector heatmap, trending table, sort buttons) — wrong file                          |

---

## Summary Statistics

| Category                            | Count             |
| ----------------------------------- | ----------------- |
| **Files with glitches**             | **26 / 26**       |
| Entirely corrupted (no usable code) | 8                 |
| Code mixed between wrong files      | 4 pairs (8 files) |
| Wrong import/module names           | 14                |
| Truncated/missing code              | 7                 |
| Inline garbage text                 | 9                 |
| Swapped file contents               | 2                 |
| Wrong type/function names           | 5                 |
| Typos in code                       | 3                 |
