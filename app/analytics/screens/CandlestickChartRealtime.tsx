import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import CandlestickChart, { CandleData } from '../components/charts/CandlestickChartComponent';
import { connectToFinnhub } from '../services/realTimeSocket';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

type CandleBuilder = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  startTime: number;
  tradeCount: number;
};

export default function CandlestickChartRealtime() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [candles, setCandles] = useState<{ [symbol: string]: CandleData[] }>({
    'AAPL': [],
    'BINANCE:BTCUSDT': [],
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  
  const currentCandleRef = useRef<{ [symbol: string]: CandleBuilder }>({});
  const candleIntervalRef = useRef<{ [symbol: string]: ReturnType<typeof setTimeout> }>({});
  
  // Candle interval in milliseconds (5 seconds for demo)
  const CANDLE_INTERVAL = 5000;

  // WebSocket connection
  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`;
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        setTrades((prev) => [...data, ...prev].slice(0, 50));
        
        // Process trades into candles
        data.forEach((trade) => {
          const symbol = trade.s;
          
          // Initialize candle if doesn't exist
          if (!currentCandleRef.current[symbol]) {
            currentCandleRef.current[symbol] = {
              open: trade.p,
              high: trade.p,
              low: trade.p,
              close: trade.p,
              volume: trade.v,
              startTime: trade.t,
              tradeCount: 1,
            };

            // Set interval to close candle
            if (candleIntervalRef.current[symbol]) {
              clearTimeout(candleIntervalRef.current[symbol]);
            }
            
            candleIntervalRef.current[symbol] = setTimeout(() => {
              closeCandle(symbol);
            }, CANDLE_INTERVAL);
          } else {
            // Update existing candle
            const candle = currentCandleRef.current[symbol];
            candle.high = Math.max(candle.high, trade.p);
            candle.low = Math.min(candle.low, trade.p);
            candle.close = trade.p;
            candle.volume += trade.v;
            candle.tradeCount += 1;
          }
        });
      }) || {};

    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
      // Clear all intervals
      Object.values(candleIntervalRef.current).forEach(clearTimeout);
    };
  }, []);

  // Close candle and start new one
  const closeCandle = (symbol: string) => {
    const candle = currentCandleRef.current[symbol];
    if (candle) {
      const newCandle: CandleData = {
        timestamp: candle.startTime,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      };

      setCandles((prev) => ({
        ...prev,
        [symbol]: [newCandle, ...prev[symbol]].slice(0, 30), // Keep last 30 candles
      }));

      // Reset current candle
      delete currentCandleRef.current[symbol];
    }
  };

  // Get current candle data for display
  const getCurrentCandle = (symbol: string): CandleBuilder | null => {
    return currentCandleRef.current[symbol] || null;
  };

  const currentCandle = getCurrentCandle(selectedSymbol);
  const displayCandles = candles[selectedSymbol] || [];

  // Calculate statistics
  const stats = {
    totalCandles: displayCandles.length,
    avgVolume: displayCandles.length > 0
      ? displayCandles.reduce((sum, c) => sum + (c.volume || 0), 0) / displayCandles.length
      : 0,
    bullishCount: displayCandles.filter(c => c.close >= c.open).length,
    bearishCount: displayCandles.filter(c => c.close < c.open).length,
    priceChange: displayCandles.length > 1
      ? ((displayCandles[0].close - displayCandles[displayCandles.length - 1].close) / displayCandles[displayCandles.length - 1].close) * 100
      : 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>🕯️ Real-time Candlestick Chart</Text>
      <Text style={styles.subHeader}>OHLC visualization with {CANDLE_INTERVAL / 1000}s intervals</Text>

      {/* Symbol Selector */}
      <View style={styles.symbolSelector}>
        <FocusableCard onPress={() => setSelectedSymbol('AAPL')}>
          <View style={[
            styles.symbolButton,
            selectedSymbol === 'AAPL' && styles.symbolButtonActive
          ]}>
            <Text style={[
              styles.symbolButtonText,
              selectedSymbol === 'AAPL' && styles.symbolButtonTextActive
            ]}>
              AAPL
            </Text>
          </View>
        </FocusableCard>
        
        <FocusableCard onPress={() => setSelectedSymbol('BINANCE:BTCUSDT')}>
          <View style={[
            styles.symbolButton,
            selectedSymbol === 'BINANCE:BTCUSDT' && styles.symbolButtonActive
          ]}>
            <Text style={[
              styles.symbolButtonText,
              selectedSymbol === 'BINANCE:BTCUSDT' && styles.symbolButtonTextActive
            ]}>
              BTC/USDT
            </Text>
          </View>
        </FocusableCard>
      </View>

      {/* Current Candle Info */}
      {currentCandle && (
        <View style={styles.currentCandleContainer}>
          <Text style={styles.currentCandleTitle}>🔴 Current Candle (Building)</Text>
          <View style={styles.ohlcGrid}>
            <View style={styles.ohlcItem}>
              <Text style={styles.ohlcLabel}>Open</Text>
              <Text style={styles.ohlcValue}>${currentCandle.open.toFixed(2)}</Text>
            </View>
            <View style={styles.ohlcItem}>
              <Text style={styles.ohlcLabel}>High</Text>
              <Text style={[styles.ohlcValue, { color: '#00ff88' }]}>
                ${currentCandle.high.toFixed(2)}
              </Text>
            </View>
            <View style={styles.ohlcItem}>
              <Text style={styles.ohlcLabel}>Low</Text>
              <Text style={[styles.ohlcValue, { color: '#ff3b30' }]}>
                ${currentCandle.low.toFixed(2)}
              </Text>
            </View>
            <View style={styles.ohlcItem}>
              <Text style={styles.ohlcLabel}>Close</Text>
              <Text style={styles.ohlcValue}>${currentCandle.close.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.candleStats}>
            <Text style={styles.candleStat}>
              Volume: <Text style={styles.candleStatValue}>{currentCandle.volume.toFixed(0)}</Text>
            </Text>
            <Text style={styles.candleStat}>
              Trades: <Text style={styles.candleStatValue}>{currentCandle.tradeCount}</Text>
            </Text>
            <Text style={styles.candleStat}>
              Change: <Text style={[
                styles.candleStatValue,
                { color: currentCandle.close >= currentCandle.open ? '#00ff88' : '#ff3b30' }
              ]}>
                {currentCandle.close >= currentCandle.open ? '▲' : '▼'} 
                {Math.abs(((currentCandle.close - currentCandle.open) / currentCandle.open) * 100).toFixed(2)}%
              </Text>
            </Text>
          </View>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCandles}</Text>
          <Text style={styles.statLabel}>Candles</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#00ff88' }]}>{stats.bullishCount}</Text>
          <Text style={styles.statLabel}>Bullish</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ff3b30' }]}>{stats.bearishCount}</Text>
          <Text style={styles.statLabel}>Bearish</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: stats.priceChange >= 0 ? '#00ff88' : '#ff3b30' }
          ]}>
            {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(2)}%
          </Text>
          <Text style={styles.statLabel}>Change</Text>
        </View>
      </View>

      {/* Candlestick Chart */}
      <FocusableCard>
        <View style={styles.chartContainer}>
          {displayCandles.length > 0 ? (
            <CandlestickChart
              data={[...displayCandles].reverse()} // Reverse to show chronological order
              width={screenWidth - 60}
              height={500}
              candleWidth={25}
              showVolume={true}
              showGrid={true}
              bullishColor="#00ff88"
              bearishColor="#ff3b30"
            />
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Waiting for candle data...</Text>
              <Text style={styles.loadingSubText}>
                First candle will complete in {CANDLE_INTERVAL / 1000} seconds
              </Text>
            </View>
          )}
        </View>
      </FocusableCard>

      {/* Recent Completed Candles */}
      {displayCandles.length > 0 && (
        <View style={styles.recentCandlesContainer}>
          <Text style={styles.sectionTitle}>Recent Completed Candles</Text>
          {displayCandles.slice(0, 5).map((candle, idx) => {
            const isBullish = candle.close >= candle.open;
            const change = ((candle.close - candle.open) / candle.open) * 100;
            
            return (
              <View key={`candle-${idx}`} style={styles.candleRow}>
                <View style={[
                  styles.candleIndicator,
                  { backgroundColor: isBullish ? '#00ff88' : '#ff3b30' }
                ]} />
                <View style={styles.candleRowContent}>
                  <Text style={styles.candleTime}>
                    {new Date(candle.timestamp).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.candleOHLC}>
                    O: ${candle.open.toFixed(2)} H: ${candle.high.toFixed(2)} L: ${candle.low.toFixed(2)} C: ${candle.close.toFixed(2)}
                  </Text>
                  <Text style={[
                    styles.candleChange,
                    { color: isBullish ? '#00ff88' : '#ff3b30' }
                  ]}>
                    {isBullish ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.hintText}>
        Use symbol buttons to switch • Candles update every {CANDLE_INTERVAL / 1000}s • Scroll chart horizontally
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
  symbolSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 20,
  },
  symbolButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  symbolButtonActive: {
    backgroundColor: '#00ffcc20',
    borderColor: '#00ffcc',
  },
  symbolButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  symbolButtonTextActive: {
    color: '#00ffcc',
  },
  currentCandleContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff3b30',
  },
  currentCandleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  ohlcGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  ohlcItem: {
    alignItems: 'center',
  },
  ohlcLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 5,
  },
  ohlcValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  candleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  candleStat: {
    fontSize: 12,
    color: '#888',
  },
  candleStatValue: {
    color: '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  chartContainer: {
    minHeight: 500,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  recentCandlesContainer: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  candleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  candleIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  candleRowContent: {
    flex: 1,
  },
  candleTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  candleOHLC: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
  },
  candleChange: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#666',
    marginTop: 20,
    lineHeight: 16,
  },
});
