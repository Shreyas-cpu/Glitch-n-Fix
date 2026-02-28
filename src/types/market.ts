export interface Cain {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

export interface Able {
  id: string;
  symbol: string;
  name: string;
}