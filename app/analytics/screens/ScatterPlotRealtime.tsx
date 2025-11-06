import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import ScatterChart from '../components/charts/ScatterChartComponent';
import { connectToFinnhub } from '../services/realTimeSocket';
import { useTVEventHandler } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

type ScatterDataPoint = {
  x: string | number;
  y: number;
};

type AggregatedData = {
  prices: number[];
  volumes: number[];
  labels: string[];
  timestamps: number[];
};

export default function ScatterPlotRealtimeScreen() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData>({
    prices: [],
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
        // Calculate average price and total volume from recent trades
        const recentTrades = trades.slice(0, 20);
        const avgPrice = recentTrades.reduce((sum, t) => sum + t.p, 0) / recentTrades.length;
        const totalVolume = recentTrades.reduce((sum, t) => sum + t.v, 0);
        const timestamp = Date.now();
        const timeLabel = new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });

        setAggregatedData((prev) => ({
          prices: [...prev.prices, avgPrice].slice(-20),
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

  // Format data for scatter chart (volume on x-axis, price on y-axis)
  const scatterData: ScatterDataPoint[] = aggregatedData.volumes.map((volume, index) => ({
    x: volume,
    y: aggregatedData.prices[index]
  }));

  // TV event handler
  const handleFocusChange = (index: number) => setFocusedIndex(index);
  const handleSelect = (index: number) => {
    console.log(`Selected point → Price: ${aggregatedData.prices[index]}, Volume: ${aggregatedData.volumes[index]}`);
  };

  const tvEventHandler = (evt: any) => {
    if (!evt || scatterData.length === 0) return;
    const maxLength = scatterData.length;
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
      <Text style={styles.header}>🔵 Price vs Volume Scatter Plot</Text>
      <Text style={styles.subHeader}>Correlation analysis - Updated every 30 seconds</Text>

      <FocusableCard>
        {scatterData.length > 0 ? (
          <ScatterChart
            data={scatterData}
            focusedIndex={focusedIndex}
            onFocusChange={handleFocusChange}
            onSelect={handleSelect}
            pointColor="#999"
            highlightColor="#4f6cff"
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
          {aggregatedData.prices[focusedIndex] 
            ? `Price: $${aggregatedData.prices[focusedIndex].toFixed(2)} | Volume: ${aggregatedData.volumes[focusedIndex].toFixed(0)}`
            : 'Waiting for data...'}
        </Text>
        <Text style={styles.subText}>
          {aggregatedData.labels[focusedIndex] || 'N/A'} | {scatterData.length} data points
        </Text>
      </View>

      {/* Chart Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chart Information</Text>
        <Text style={styles.legendText}>• X-axis: Trade Volume (total)</Text>
        <Text style={styles.legendText}>• Y-axis: Average Price ($)</Text>
        <Text style={styles.legendText}>• Each point represents a 30-second interval</Text>
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
  legendContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
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
