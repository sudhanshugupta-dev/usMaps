// realtimeSocket.ts
type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp (ms)
  v: number; // volume
};

type FinnhubMessage = {
  type: string;
  data?: TradeData[];
};

export const connectToFinnhub = (
  token: string,
  symbols: string[],
  onMessage?: (data: TradeData[]) => void
) => {
  if (!token) {
    console.error('❌ Missing Finnhub API token');
    return;
  }

  const FINNHUB_URL = 'wss://ws.finnhub.io?token=';
  const socket = new WebSocket(`wss://ws.finnhub.io?token=d3ss1opr01qpdd5l2d90d3ss1opr01qpdd5l2d9g`);

  socket.onopen = () => {
    console.log('✅ Connected to Finnhub WebSocket');
    symbols.forEach((symbol) => {
      socket.send(JSON.stringify({ type: 'subscribe', symbol }));
      console.log(`📡 Subscribed to: ${symbol}`);
    });
  };

  socket.onmessage = (event: WebSocketMessageEvent) => {
    try {
      const message: FinnhubMessage = JSON.parse(event.data);
      if (message.type === 'trade' && message.data) {
        onMessage?.(message.data);
        //console.log('📊 Trade data received:', message.data);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  socket.onclose = () => console.log('🔌 WebSocket closed');
  socket.onerror = (error) => console.error('⚠️ WebSocket error:', error);

  const unsubscribe = (symbol: string) => {
    socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    console.log(`🛑 Unsubscribed from: ${symbol}`);
  };

  return { socket, unsubscribe };
};
