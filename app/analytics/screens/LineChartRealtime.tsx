import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import LineChart from '../components/charts/LineChartComponent';
import {connectToFinnhub } from '../services/realTimeSocket';
import { useTVEventHandler } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};


export default function TradeLineChartScreen() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // --- WebSocket connection ---
  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`;
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        // Keep last 30 trades for better visualization
        setTrades((prev) => [...data, ...prev].slice(0, 30));
      }) || {};

    // Cleanup when component unmounts
    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
    };
  }, []);

  // --- Map trades to chart data (reverse to show chronological order) ---
  const chartData = trades.slice(0, 20).reverse().map((t) => t.p); // price as Y-axis
  const chartLabels = trades.slice(0, 20).reverse().map((t) => {
    const date = new Date(t.t);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  // --- TV event handler ---
  const handleFocusChange = (index: number) => setFocusedIndex(index);
  const handleSelect = (index: number) => {
    console.log(`Selected trade → Price: ${chartData[index]}, Time: ${chartLabels[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt) return;
    switch (evt.eventType) {
      case 'right':
        setFocusedIndex((prev) => (prev + 1) % chartData.length);
        break;
      case 'left':
        setFocusedIndex((prev) => (prev - 1 + chartData.length) % chartData.length);
        break;
      case 'select':
        handleSelect(focusedIndex);
        break;
      default:
        break;
    }
  };
  useTVEventHandler(tvEventHandler);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>📉 Real-time Price Line Chart</Text>
      <Text style={styles.subHeader}>Continuous updates from live market data</Text>

      <FocusableCard>
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            labels={chartLabels}
            focusedIndex={focusedIndex}
            onFocusChange={handleFocusChange}
            onSelect={handleSelect}
            lineColor="#00ffcc"
            highlightColor="#FFD700"
            height={300}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Waiting for data...</Text>
            <Text style={styles.loadingSubText}>Connecting to live market feed</Text>
          </View>
        )}
      </FocusableCard>

      <View style={styles.navigationContainer}>
        <Text style={styles.infoText}>
          {chartData[focusedIndex] ? `Price: $${chartData[focusedIndex].toFixed(2)} at ${chartLabels[focusedIndex]}` : 'Waiting for data...'}
        </Text>
        <Text style={styles.subText}>
          Real-time updates | {chartData.length} data points
        </Text>
      </View>

      {/* Recent Trades Info */}
      <View style={styles.tradesContainer}>
        <Text style={styles.tradesHeader}>Recent Trades (Last 5)</Text>
        {trades.slice(0, 5).map((trade, index) => (
          <View key={`trade-${trade.s}-${trade.t}-${index}`} style={styles.tradeItem}>
            <Text style={styles.symbol}>{trade.s}</Text>
            <Text style={styles.price}>${trade.p.toFixed(2)}</Text>
            <Text style={styles.volume}>Vol: {trade.v}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  contentContainer: { 
    padding: 20, 
    alignItems: 'center' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#fff', 
    textAlign: 'center' 
  },
  subHeader: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#00ffcc',
    marginBottom: 10,
  },
  loadingSubText: {
    fontSize: 12,
    color: '#888',
  },
  navigationContainer: { 
    marginTop: 20, 
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  infoText: { 
    fontSize: 18, 
    color: '#00ffcc',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subText: {
    fontSize: 12,
    color: '#888',
  },
  tradesContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  tradesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#333',
  },
  symbol: { 
    color: '#00FFAA', 
    fontWeight: '600', 
    fontSize: 14 
  },
  price: { 
    color: '#fff', 
    fontSize: 14 
  },
  volume: { 
    color: '#888', 
    fontSize: 12 
  },
});
