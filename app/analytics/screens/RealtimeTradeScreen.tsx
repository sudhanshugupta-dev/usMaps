// RealtimeTradeScreen.tsx
import React, { useEffect, useState ,} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity,  } from 'react-native';
import { connectToFinnhub } from '../services/realTimeSocket';

import { useRouter } from 'expo-router';

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

export default function RealtimeTradeScreen() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`; // <-- replace with real token
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        // Keep only the last 10 updates for display
        setTrades((prev) => [...data, ...prev].slice(0, 10));
      }) || {};

    // Cleanup when component unmounts
    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Real-time Trades</Text>
      <FlatList
        data={trades}
        keyExtractor={(item, index) => `${item.s}-${item.t}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.tradeItem}>
            <Text style={styles.symbol}>{item.s}</Text>
            <Text style={styles.price}>${item.p.toFixed(2)}</Text>
            <Text style={styles.volume}>Vol: {item.v}</Text>
          </View>
        )}
      />
      <TouchableOpacity onPress={() => router.push('/LineChartRealtime')}>
        <Text>Line Chart screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A0A0A',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#333',
  },
  symbol: { color: '#00FFAA', fontWeight: '600', fontSize: 16 },
  price: { color: '#fff', fontSize: 16 },
  volume: { color: '#888', fontSize: 14 },
});
