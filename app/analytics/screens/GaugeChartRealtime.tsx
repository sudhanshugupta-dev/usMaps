import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import GaugeChart from '../components/charts/GaugeChartComponent';
import { connectToFinnhub } from '../services/realTimeSocket';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

export default function GaugeChartRealtime() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [volumeRange, setVolumeRange] = useState({ min: 0, max: 1000 });

  // WebSocket connection
  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`;
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        setTrades((prev) => {
          const newTrades = [...data, ...prev].slice(0, 50);
          
          // Calculate dynamic ranges for gauges
          const prices = newTrades.map(t => t.p);
          const volumes = newTrades.map(t => t.v);
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange({ min: minPrice, max: maxPrice });
          }
          
          if (volumes.length > 0) {
            const minVol = Math.min(...volumes);
            const maxVol = Math.max(...volumes);
            setVolumeRange({ min: minVol, max: maxVol });
          }
          
          return newTrades;
        });
      }) || {};

    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
    };
  }, []);

  // Get latest trade data
  const latestTrade = trades[0];
  
  // Calculate gauge values (0-100 scale)
  const priceGaugeValue = latestTrade
    ? ((latestTrade.p - priceRange.min) / (priceRange.max - priceRange.min)) * 100
    : 0;
    
  const volumeGaugeValue = latestTrade
    ? ((latestTrade.v - volumeRange.min) / (volumeRange.max - volumeRange.min)) * 100
    : 0;

  // Calculate price change percentage (comparing to average)
  const avgPrice = trades.length > 0
    ? trades.reduce((sum, t) => sum + t.p, 0) / trades.length
    : 0;
  const priceChangePercent = latestTrade && avgPrice > 0
    ? ((latestTrade.p - avgPrice) / avgPrice) * 100
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>📊 Real-time Gauge Charts</Text>
      <Text style={styles.subHeader}>Live market data visualization</Text>

      {latestTrade ? (
        <>
          {/* Current Symbol Info */}
          <View style={styles.symbolInfo}>
            <Text style={styles.symbolText}>{latestTrade.s}</Text>
            <Text style={styles.priceText}>${latestTrade.p.toFixed(2)}</Text>
            <Text style={[
              styles.changeText,
              { color: priceChangePercent >= 0 ? '#00ff88' : '#ff3b30' }
            ]}>
              {priceChangePercent >= 0 ? '▲' : '▼'} {Math.abs(priceChangePercent).toFixed(2)}%
            </Text>
          </View>

          {/* Gauge Charts Grid */}
          <View style={styles.gaugesContainer}>
            {/* Price Gauge */}
            <FocusableCard>
              <View style={styles.gaugeWrapper}>
                <GaugeChart
                  value={priceGaugeValue}
                  maxValue={100}
                  radius={80}
                  strokeWidth={15}
                  dynamicColor={true}
                  showValue={true}
                  label="Price Range"
                  unit="%"
                />
                <Text style={styles.gaugeInfo}>
                  ${priceRange.min.toFixed(2)} - ${priceRange.max.toFixed(2)}
                </Text>
              </View>
            </FocusableCard>

            {/* Volume Gauge */}
            <FocusableCard>
              <View style={styles.gaugeWrapper}>
                <GaugeChart
                  value={volumeGaugeValue}
                  maxValue={100}
                  radius={80}
                  strokeWidth={15}
                  dynamicColor={true}
                  showValue={true}
                  label="Volume Range"
                  unit="%"
                />
                <Text style={styles.gaugeInfo}>
                  {volumeRange.min.toFixed(0)} - {volumeRange.max.toFixed(0)}
                </Text>
              </View>
            </FocusableCard>

            {/* Price Change Gauge */}
            <FocusableCard>
              <View style={styles.gaugeWrapper}>
                <GaugeChart
                  value={Math.min(Math.abs(priceChangePercent) * 10, 100)}
                  maxValue={100}
                  radius={80}
                  strokeWidth={15}
                  color={priceChangePercent >= 0 ? '#00ff88' : '#ff3b30'}
                  showValue={true}
                  label="Price Volatility"
                  unit="%"
                />
                <Text style={styles.gaugeInfo}>
                  vs Avg: ${avgPrice.toFixed(2)}
                </Text>
              </View>
            </FocusableCard>
          </View>

          {/* Recent Trades */}
          <View style={styles.tradesContainer}>
            <Text style={styles.tradesHeader}>Recent Trades (Last 5)</Text>
            {trades.slice(0, 5).map((trade, index) => (
              <View key={`trade-${trade.s}-${trade.t}-${index}`} style={styles.tradeItem}>
                <Text style={styles.symbol}>{trade.s}</Text>
                <Text style={styles.price}>${trade.p.toFixed(2)}</Text>
                <Text style={styles.volume}>Vol: {trade.v.toFixed(0)}</Text>
                <Text style={styles.time}>
                  {new Date(trade.t).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Trades</Text>
              <Text style={styles.statValue}>{trades.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Price</Text>
              <Text style={styles.statValue}>${avgPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Latest Vol</Text>
              <Text style={styles.statValue}>{latestTrade.v.toFixed(0)}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Waiting for data...</Text>
          <Text style={styles.loadingSubText}>Connecting to live market feed</Text>
        </View>
      )}

      <Text style={styles.hintText}>
        Use Left/Right to navigate gauges • OK to select
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  symbolInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  symbolText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  gaugesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    gap: 15,
    marginBottom: 20,
  },
  gaugeWrapper: {
    padding: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  gaugeInfo: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  tradesContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
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
    fontSize: 14,
    flex: 1,
  },
  price: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  volume: {
    color: '#888',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  time: {
    color: '#666',
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ffcc',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
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
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 20,
  },
});
