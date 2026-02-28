# Glitch-n-Fix

Simple React + Express dashboard demo using Vite and CoinGecko.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the backend** (Express) in one terminal:
   ```bash
   npm start
   ```
   The API will be available on `http://localhost:3000`.
   
   *Tip:* to launch both server and client together and open the browser, use the helper script:
   ```bash
   npm run dev:full   # Linux/macOS only, uses shell `&`
   ```
   It starts the Express API in the background and then runs Vite with `--open`.
   If you have a Gemini (or other) API key, place it in a `.env` file at the
   repo root. `.env` is ignored by git already so your secret will remain
   private. Example contents:
   ```env
   GEMINI_API_KEY="your_key_here"
   GOOGLE_API_KEY="your_key_here" # optional
   ```
   The backend will pick up the key via `dotenv` automatically.

3. **Run the frontend** (Vite) in another terminal (or use `dev:full`):
   ```bash
   npm run dev
   ```
   This starts the dev server on `http://localhost:5173` (Vite is now
   forced to use port 5173 so the URL never changes).  If the port is
   still taken the terminal will warn; use the printed address.  The
   dashboard polls every few seconds so you should see prices and the
   “Last updated” timestamp update in real time.

   The Vite config already proxies `/api` requests to the backend, so
   you can hit the endpoints without changing the URLs.

4. **Optional combined script**
   You can add a tool like `concurrently` or manually run both commands
   side‑by‑side when developing.

## Common issues

- **Black screen / `watchlist.map is not a function`**
  Occurs when the backend is not running or proxy is missing. Make sure
  you've started the Express server and the Vite proxy is enabled.

- **Styles not applied**
  Tailwind requires `tailwind.config.ts` (already included) and the
  `@tailwindcss/vite` plugin. Rebuild if the config changes.

Happy hacking!
