import { useState, useEffect, useRef } from 'react';

// Connects to Binance WebSocket for top crypto pairs
export function useLiveCryptoPrices(symbols: string[] = ['btcusdt', 'ethusdt', 'solusdt', 'dogeusdt', 'pepeusdt', 'linkusdt', 'arbusdt', 'avaxusdt', 'tonusdt', 'wifusdt', 'bonkusdt', 'flokiusdt', 'rndrusdt', 'shibusdt', 'dydxusdt', 'apeusdt', 'sandusdt', 'galausdt']) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (symbols.length === 0) return;

    // Create the stream URL
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 's' is symbol (e.g., BTCUSDT), 'c' is current price
          if (data.s && data.c) {
            setPrices((prev) => ({
              ...prev,
              [data.s]: parseFloat(data.c),
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed, attempting to reconnect...");
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        // Remove onclose listener to prevent automatic reconnection when unmounting
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [symbols.join(',')]); // Dependency array based on serialized symbols string

  return prices;
}
