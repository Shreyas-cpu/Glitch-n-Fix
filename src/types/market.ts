export interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
}

export interface PortfolioHolding {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgPrice: number;
}

export interface TradeTransaction {
  id: string;
  type: "buy" | "sell";
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  pricePerUnit: number;
  total: number;
  pnl?: number;
  timestamp: string;
}
