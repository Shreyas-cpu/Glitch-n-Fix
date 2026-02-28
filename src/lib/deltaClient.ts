/**
 * Delta Exchange API Client
 *
 * Handles authenticated and unauthenticated requests to the Delta Exchange REST API.
 * Uses HMAC-SHA256 for request signing as required by the Delta API.
 *
 * Environment variables required:
 *   DELTA_API_KEY      – your Delta Exchange API key
 *   DELTA_API_SECRET   – your Delta Exchange API secret
 *   DELTA_API_BASE_URL – base URL (default: https://api.delta.exchange)
 *
 * Reference: https://docs.delta.exchange
 */

import crypto from "crypto";

// ── Config ──────────────────────────────────────────────────────────

const API_KEY = process.env.DELTA_API_KEY ?? "";
const API_SECRET = process.env.DELTA_API_SECRET ?? "";
const BASE_URL = process.env.DELTA_API_BASE_URL ?? "https://api.delta.exchange";

// ── Error types ─────────────────────────────────────────────────────

export type ApiErrorKind = "auth" | "rate-limit" | "network" | "not-found" | "server" | "unknown";

export class DeltaApiError extends Error {
  kind: ApiErrorKind;
  status: number;
  constructor(message: string, kind: ApiErrorKind, status: number) {
    super(message);
    this.name = "DeltaApiError";
    this.kind = kind;
    this.status = status;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return API_KEY.length > 0 && API_SECRET.length > 0;
}

/**
 * HMAC-SHA256 signature for authenticated endpoints.
 * Delta expects: HMAC(method + timestamp + path + query + body)
 */
function signRequest(
  method: string,
  path: string,
  queryString: string,
  body: string,
  timestamp: string,
): string {
  const payload = method + timestamp + "/v2" + path + queryString + body;
  return crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
}

function classifyStatus(status: number): ApiErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate-limit";
  if (status === 404) return "not-found";
  if (status >= 500) return "server";
  return "unknown";
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  { query, body, auth = false }: { query?: Record<string, string>; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const url = new URL(`/v2${path}`, BASE_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const bodyStr = body ? JSON.stringify(body) : "";
  const queryString = url.search; // includes "?" prefix

  if (auth) {
    if (!isConfigured()) {
      throw new DeltaApiError(
        "Delta API keys not configured. Set DELTA_API_KEY and DELTA_API_SECRET in .env",
        "auth",
        0,
      );
    }
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signRequest(method, path, queryString, bodyStr, timestamp);
    headers["api-key"] = API_KEY;
    headers["signature"] = signature;
    headers["timestamp"] = timestamp;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: bodyStr || undefined,
    });
  } catch (err: any) {
    throw new DeltaApiError(
      `Network error contacting Delta API: ${err?.message ?? "unknown"}`,
      "network",
      0,
    );
  }

  if (!response.ok) {
    const kind = classifyStatus(response.status);
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message ?? errBody?.message ?? JSON.stringify(errBody);
    } catch {
      detail = response.statusText;
    }

    // Handle auth errors gracefully (API key may need 5 min warmup)
    if (kind === "auth") {
      throw new DeltaApiError(
        `Delta API auth error: ${detail}. Note: new API keys take ~5 minutes to become operational.`,
        "auth",
        response.status,
      );
    }
    if (kind === "rate-limit") {
      throw new DeltaApiError(
        "Delta API rate limit reached. Please wait before retrying.",
        "rate-limit",
        response.status,
      );
    }
    throw new DeltaApiError(
      `Delta API error (${response.status}): ${detail}`,
      kind,
      response.status,
    );
  }

  const json = await response.json();
  return (json.result ?? json) as T;
}

// ── Public API Functions ────────────────────────────────────────────

export interface DeltaTicker {
  symbol: string;
  product_id: number;
  mark_price: string;
  spot_price: string;
  last_price?: string;
  volume: string;
  turnover: string;
  open: string;
  high: string;
  low: string;
  close: string;
  price_change_24h?: string;
  price_change_percent_24h?: string;
}

export interface DeltaProduct {
  id: number;
  symbol: string;
  description: string;
  underlying_asset: { symbol: string; id: number };
  quoting_asset: { symbol: string; id: number };
  product_type: string;
  state: string;
}

export interface DeltaCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DeltaOrder {
  id: number;
  product_id: number;
  side: "buy" | "sell";
  size: number;
  limit_price: string;
  order_type: string;
  state: string;
  created_at: string;
}

export interface DeltaPosition {
  product_id: number;
  product_symbol: string;
  size: number;
  entry_price: string;
  margin: string;
  liquidation_price: string;
  realized_pnl: string;
  unrealized_pnl: string;
}

export interface DeltaFill {
  id: number;
  product_id: number;
  side: string;
  size: number;
  price: string;
  created_at: string;
  role: string;
}

/**
 * Get all available products (trading pairs)
 */
export async function getProducts(): Promise<DeltaProduct[]> {
  return request<DeltaProduct[]>("GET", "/products");
}

/**
 * Get tickers for all products (or filter by specific symbols later)
 */
export async function getTickers(): Promise<DeltaTicker[]> {
  const data = await request<DeltaTicker[]>("GET", "/tickers");
  return Array.isArray(data) ? data : [];
}

/**
 * Get ticker for a specific product symbol
 */
export async function getTicker(symbol: string): Promise<DeltaTicker | null> {
  try {
    const data = await request<DeltaTicker>("GET", `/tickers/${symbol}`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Get order book for a symbol
 */
export async function getOrderBook(
  productId: number,
): Promise<{ buy: Array<{ price: string; size: number }>; sell: Array<{ price: string; size: number }> }> {
  return request("GET", `/l2orderbook/${productId}`);
}

/**
 * Get historical candlestick data (OHLCV)
 * @param symbol - product symbol (e.g. "BTCUSD")
 * @param resolution - candle interval: "1m", "5m", "15m", "1h", "4h", "1d"
 * @param start - start timestamp (epoch seconds)
 * @param end - end timestamp (epoch seconds)
 */
export async function getHistoricalPrices(
  symbol: string,
  resolution: string = "1h",
  start?: number,
  end?: number,
): Promise<DeltaCandle[]> {
  const now = Math.floor(Date.now() / 1000);
  const query: Record<string, string> = {
    symbol,
    resolution,
    start: String(start ?? now - 7 * 24 * 3600),
    end: String(end ?? now),
  };
  try {
    return await request<DeltaCandle[]>("GET", "/history/candles", { query });
  } catch {
    return [];
  }
}

/**
 * Place an order (authenticated)
 */
export async function placeOrder(params: {
  product_id: number;
  side: "buy" | "sell";
  size: number;
  order_type: "limit_order" | "market_order";
  limit_price?: string;
  stop_price?: string;
  stop_order_type?: "stop_loss_order" | "take_profit_order";
  time_in_force?: "gtc" | "ioc" | "fok";
}): Promise<DeltaOrder> {
  return request<DeltaOrder>("POST", "/orders", { body: params, auth: true });
}

/**
 * Get portfolio / wallet balances (authenticated)
 */
export async function getPortfolio(): Promise<any> {
  return request("GET", "/wallet/balances", { auth: true });
}

/**
 * Get open orders (authenticated)
 */
export async function getOpenOrders(productId?: number): Promise<DeltaOrder[]> {
  const query: Record<string, string> = {};
  if (productId) query.product_id = String(productId);
  return request<DeltaOrder[]>("GET", "/orders", { query, auth: true });
}

/**
 * Get positions (authenticated)
 */
export async function getPositions(): Promise<DeltaPosition[]> {
  return request<DeltaPosition[]>("GET", "/positions", { auth: true });
}

/**
 * Get trade history / fills (authenticated)
 */
export async function getTradeHistory(productId?: number): Promise<DeltaFill[]> {
  const query: Record<string, string> = {};
  if (productId) query.product_id = String(productId);
  return request<DeltaFill[]>("GET", "/fills", { query, auth: true });
}

/**
 * Cancel an order (authenticated)
 */
export async function cancelOrder(orderId: number, productId: number): Promise<void> {
  await request("DELETE", "/orders", {
    body: { id: orderId, product_id: productId },
    auth: true,
  });
}

/**
 * Check if Delta API credentials are configured
 */
export function isDeltaConfigured(): boolean {
  return isConfigured();
}
