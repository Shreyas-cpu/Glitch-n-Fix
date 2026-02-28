# Nexus Terminal — Glitch & Fix 2026 (Track B: Web3)

**Nexus Terminal** is a modern, high-performance Web3 tracking and trading dashboard. Built with React and Vite, the platform offers real-time cryptocurrency data visualization, simulated order execution (buy/sell), portfolio tracking, and wallet connectivity integration.

This project was originally corrupted with 14 intentional bugs during the **Glitch & Fix 2026 Hackathon**. This repository now represents the fully restored and enhanced clean version.

---

## 🚀 Features

- **Live Market Feed:** Real-time asset prices, market caps, and volume metrics powered by CoinGecko API.
- **Simulated Trading:** Execute Buy/Sell orders using an integrated internal trading engine with simulated ETH balances.
- **Portfolio Tracking:** Dynamic calculation of user holdings, average entry prices, and total value based on full transaction history.
- **Secure Architecture:** Hardened backend server with strict request body validation, regex param sanitization, and 429 rate limit handling.
- **Interactive UI:** Glassmorphic layout using Tailwind CSS, animated with Framer Motion, and charting via Recharts.

---

## 🛠️ The "Glitch & Fix" Audit Summary

In total, **14 critical bugs and vulnerabilities** were identified and fixed. For extensive line-by-line documentation, please review our specialized log files:

1. [**fixes_readme.md**](fixes_readme.md) — Detailed technical breakdown of all 14 squashed bugs (infinite loops, XSS, prototype pollution, exposed API keys, and React runtime crashes).
2. [**changes_readme.md**](changes_readme.md) — Chronological log of all architectural changes, file restorations, and new feature implementations.
3. [**glitched_readme.md**](glitched_readme.md) — A read-only archive documenting every corrupted file and troll message found in the initial codebase state.

### High-Level Bug Categories Resolved:

- **Security:** Removed hardcoded API keys from client bundles; implemented strict POST/DELETE sanitization to prevent XSS.
- **Logic & State:** Fixed infinite `useEffect` network loops; solved React runtime crashes (`EADDRINUSE`, undefined optional chaining).
- **Wiring & Data:** Restored corrupted JSON data stores; built reliable fallback UIs for rate-limited external APIs.
- **Structure:** Rebuilt heavily truncated UI components (`Sidebar`, `StatCard`, `WatchlistSidebar`).

---

## 📦 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation & Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example` for required keys):

   ```env
   VITE_APP_URL="http://localhost:3000"
   GEMINI_API_KEY="your_api_key_here" # Not required for core functionality
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The backend API and Vite frontend will boot concurrently on `http://localhost:3000`.

---

## 🏗️ Core Technologies

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, tsx
- **Data & State:** React Query (@tanstack/react-query), Axios
- **Data Source:** CoinGecko API V3

---

_“Glitch & Fix 2026 — Track B” Complete. All systems operational._
