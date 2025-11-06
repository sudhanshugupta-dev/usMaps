import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import BarChart from '../components/charts/BarChartComponent';
import { connectToFinnhub } from '../services/realTimeSocket';
import { useTVEventHandler } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

type AggregatedData = {
  volumes: number[];
  labels: string[];
  timestamps: number[];
};

export default function BarChartRealtimeScreen() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData>({
    volumes: [],
    labels: [],
    timestamps: []
  });

  // WebSocket connection for real-time data
  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`;
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        setTrades((prev) => [...data, ...prev].slice(0, 100));
      }) || {};

    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
    };
  }, []);

  // Aggregate data every 30 seconds
  useEffect(() => {
    const aggregateData = () => {
      if (trades.length > 0) {
        // Calculate total volume from recent trades
        const recentTrades = trades.slice(0, 20);
        const totalVolume = recentTrades.reduce((sum, t) => sum + t.v, 0);
        const timestamp = Date.now();
        const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });

        setAggregatedData((prev) => ({
          volumes: [...prev.volumes, totalVolume].slice(-20),
          labels: [...prev.labels, timeLabel].slice(-20),
          timestamps: [...prev.timestamps, timestamp].slice(-20)
        }));
      }
    };

    // Initial aggregation
    aggregateData();

    // Set up interval for 30-second updates
    const interval = setInterval(aggregateData, 30000);

    return () => clearInterval(interval);
  }, [trades]);

  // TV event handler
  const handleFocusChange = (index: number) => setFocusedIndex(index);
  const handleSelect = (index: number) => {
    console.log(`Selected bar → Volume: ${aggregatedData.volumes[index]}, Time: ${aggregatedData.labels[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt || aggregatedData.volumes.length === 0) return;
    const maxLength = aggregatedData.volumes.length;
    switch (evt.eventType) {
      case 'right':
        setFocusedIndex((prev) => (prev + 1) % maxLength);
        break;
      case 'left':
        setFocusedIndex((prev) => (prev - 1 + maxLength) % maxLength);
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
      <Text style={styles.header}>📊 Trade Volume Bar Chart</Text>
      <Text style={styles.subHeader}>Aggregated every 30 seconds</Text>

      <FocusableCard>
        {aggregatedData.volumes.length > 0 ? (
          <BarChart
            data={aggregatedData.volumes}
            labels={aggregatedData.labels}
            focusedIndex={focusedIndex}
            onFocusChange={handleFocusChange}
            onSelect={handleSelect}
            barColor="#ff6f61"
            highlightColor="#FFD700"
            height={300}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Waiting for data...</Text>
            <Text style={styles.loadingSubText}>Collecting trades for first aggregation</Text>
          </View>
        )}
      </FocusableCard>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {aggregatedData.volumes[focusedIndex] 
            ? `Total Volume: ${aggregatedData.volumes[focusedIndex].toFixed(0)} at ${aggregatedData.labels[focusedIndex]}`
            : 'Waiting for data...'}
        </Text>
        <Text style={styles.subText}>
          Updates every 30 seconds | {aggregatedData.volumes.length} data points
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
  infoContainer: { 
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
