import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { FocusableCard } from '../components/FocusableCard';
import GanttChart, { GanttTask } from '../components/charts/GanttChartComponent';
import { connectToFinnhub } from '../services/realTimeSocket';

const { width: screenWidth } = Dimensions.get('window');

type TradeData = {
  p: number; // price
  s: string; // symbol
  t: number; // timestamp
  v: number; // volume
};

type TradingSession = {
  symbol: string;
  startTime: number;
  endTime: number;
  tradeCount: number;
  totalVolume: number;
  avgPrice: number;
  color: string;
};

export default function GanttChartRealtime() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [sessions, setSessions] = useState<TradingSession[]>([]);
  const sessionTimeoutRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  const activeSessionsRef = useRef<{ [key: string]: TradingSession }>({});

  // Symbol colors
  const symbolColors: { [key: string]: string } = {
    'AAPL': '#00ff88',
    'BINANCE:BTCUSDT': '#ffd700',
  };

  // WebSocket connection
  useEffect(() => {
    const token = `d3ss1opr01qpdd5l2dag`;
    const symbols = ['AAPL', 'BINANCE:BTCUSDT'];

    const { socket, unsubscribe } =
      connectToFinnhub(token, symbols, (data: TradeData[]) => {
        setTrades((prev) => [...data, ...prev].slice(0, 100));
        
        // Process trades into sessions
        data.forEach((trade) => {
          const sessionKey = trade.s;
          
          // Clear existing timeout for this symbol
          if (sessionTimeoutRef.current[sessionKey]) {
            clearTimeout(sessionTimeoutRef.current[sessionKey]);
          }

          // Update or create active session
          if (activeSessionsRef.current[sessionKey]) {
            // Update existing session
            const session = activeSessionsRef.current[sessionKey];
            session.endTime = trade.t;
            session.tradeCount += 1;
            session.totalVolume += trade.v;
            session.avgPrice = (session.avgPrice * (session.tradeCount - 1) + trade.p) / session.tradeCount;
          } else {
            // Create new session
            activeSessionsRef.current[sessionKey] = {
              symbol: trade.s,
              startTime: trade.t,
              endTime: trade.t,
              tradeCount: 1,
              totalVolume: trade.v,
              avgPrice: trade.p,
              color: symbolColors[trade.s] || '#00ffcc',
            };
          }

          // Set timeout to close session after 3 seconds of inactivity
          sessionTimeoutRef.current[sessionKey] = setTimeout(() => {
            if (activeSessionsRef.current[sessionKey]) {
              setSessions((prev) => {
                const newSession = { ...activeSessionsRef.current[sessionKey] };
                delete activeSessionsRef.current[sessionKey];
                return [newSession, ...prev].slice(0, 20); // Keep last 20 sessions
              });
            }
          }, 3000);
        });
      }) || {};

    return () => {
      symbols.forEach((symbol) => unsubscribe?.(symbol));
      socket?.close();
      // Clear all timeouts
      Object.values(sessionTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Convert sessions to Gantt tasks
  const ganttTasks: GanttTask[] = [
    // Active sessions (ongoing)
    ...Object.values(activeSessionsRef.current).map((session, idx) => ({
      id: `active-${session.symbol}-${session.startTime}`,
      name: `${session.symbol} (Active)`,
      startTime: session.startTime,
      endTime: session.endTime,
      color: session.color,
      symbol: session.symbol,
    })),
    // Completed sessions
    ...sessions.map((session, idx) => ({
      id: `session-${session.symbol}-${session.startTime}`,
      name: session.symbol,
      startTime: session.startTime,
      endTime: session.endTime,
      color: session.color,
      symbol: session.symbol,
    })),
  ];

  // Calculate statistics
  const totalSessions = sessions.length + Object.keys(activeSessionsRef.current).length;
  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / sessions.length / 1000
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>📊 Real-time Gantt Chart</Text>
      <Text style={styles.subHeader}>Trading sessions timeline visualization</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Object.keys(activeSessionsRef.current).length}</Text>
          <Text style={styles.statLabel}>Active Now</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgSessionDuration.toFixed(1)}s</Text>
          <Text style={styles.statLabel}>Avg Duration</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{trades.length}</Text>
          <Text style={styles.statLabel}>Total Trades</Text>
        </View>
      </View>

      {/* Gantt Chart */}
      <FocusableCard>
        <View style={styles.chartContainer}>
          {ganttTasks.length > 0 ? (
            <GanttChart
              tasks={ganttTasks}
              width={screenWidth - 60}
              height={400}
              barHeight={35}
              showTimeline={true}
              backgroundColor="#1a1a1a"
            />
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Waiting for trading data...</Text>
              <Text style={styles.loadingSubText}>Sessions will appear as trades arrive</Text>
            </View>
          )}
        </View>
      </FocusableCard>

      {/* Active Sessions Details */}
      {Object.keys(activeSessionsRef.current).length > 0 && (
        <View style={styles.activeSessionsContainer}>
          <Text style={styles.sectionTitle}>🔴 Active Sessions</Text>
          {Object.values(activeSessionsRef.current).map((session, idx) => (
            <View key={`active-${session.symbol}-${idx}`} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={[styles.colorDot, { backgroundColor: session.color }]} />
                <Text style={styles.sessionSymbol}>{session.symbol}</Text>
                <Text style={styles.sessionStatus}>LIVE</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  Trades: <Text style={styles.sessionDetailValue}>{session.tradeCount}</Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Avg Price: <Text style={styles.sessionDetailValue}>${session.avgPrice.toFixed(2)}</Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Volume: <Text style={styles.sessionDetailValue}>{session.totalVolume.toFixed(0)}</Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Duration: <Text style={styles.sessionDetailValue}>
                    {((session.endTime - session.startTime) / 1000).toFixed(1)}s
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Completed Sessions */}
      {sessions.length > 0 && (
        <View style={styles.completedSessionsContainer}>
          <Text style={styles.sectionTitle}>✓ Recent Completed Sessions</Text>
          {sessions.slice(0, 5).map((session, idx) => (
            <View key={`completed-${session.symbol}-${idx}`} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={[styles.colorDot, { backgroundColor: session.color }]} />
                <Text style={styles.sessionSymbol}>{session.symbol}</Text>
                <Text style={styles.sessionStatusCompleted}>COMPLETED</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  Trades: <Text style={styles.sessionDetailValue}>{session.tradeCount}</Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Avg Price: <Text style={styles.sessionDetailValue}>${session.avgPrice.toFixed(2)}</Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Duration: <Text style={styles.sessionDetailValue}>
                    {((session.endTime - session.startTime) / 1000).toFixed(1)}s
                  </Text>
                </Text>
                <Text style={styles.sessionDetail}>
                  Ended: <Text style={styles.sessionDetailValue}>
                    {new Date(session.endTime).toLocaleTimeString()}
                  </Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.hintText}>
        Sessions auto-close after 3s of inactivity • Scroll chart horizontally
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
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  chartContainer: {
    minHeight: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: 400,
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
  activeSessionsContainer: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  completedSessionsContainer: {
    marginTop: 15,
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
  sessionCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  sessionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  sessionStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ff3b30',
    backgroundColor: '#ff3b3020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sessionStatusCompleted: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00ff88',
    backgroundColor: '#00ff8820',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  sessionDetail: {
    fontSize: 12,
    color: '#888',
  },
  sessionDetailValue: {
    color: '#fff',
    fontWeight: '600',
  },
  hintText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 20,
  },
});
