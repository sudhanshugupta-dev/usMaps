import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  candleWidth?: number;
  showVolume?: boolean;
  showGrid?: boolean;
  bullishColor?: string;
  bearishColor?: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  width = 800,
  height = 400,
  candleWidth = 20,
  showVolume = true,
  showGrid = true,
  bullishColor = '#00ff88',
  bearishColor = '#ff3b30',
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No candlestick data available</Text>
      </View>
    );
  }

  // Calculate price range
  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Calculate volume range if showing volume
  const volumes = data.map(d => d.volume || 0);
  const maxVolume = Math.max(...volumes);

  // Layout constants
  const padding = { top: 40, right: 60, bottom: showVolume ? 120 : 60, left: 60 };
  const chartHeight = height - padding.top - padding.bottom;
  const volumeHeight = showVolume ? 80 : 0;
  const priceChartHeight = chartHeight - volumeHeight - 10;
  const candleSpacing = 5;
  const totalCandleWidth = candleWidth + candleSpacing;
  const chartWidth = Math.max(width - padding.left - padding.right, data.length * totalCandleWidth);

  // Convert price to Y coordinate
  const priceToY = (price: number) => {
    return padding.top + ((maxPrice - price) / priceRange) * priceChartHeight;
  };

  // Format price
  const formatPrice = (price: number) => {
    return price >= 1000 ? price.toFixed(0) : price.toFixed(2);
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Generate Y-axis labels
  const yAxisLabels = () => {
    const labels = [];
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
      const price = maxPrice - (priceRange * i) / numLabels;
      const y = priceToY(price);
      labels.push({ price, y });
    }
    return labels;
  };

  return (
    <ScrollView 
      horizontal 
      style={styles.container}
      showsHorizontalScrollIndicator={true}
    >
      <View style={{ width: chartWidth + padding.left + padding.right }}>
        <Svg width={chartWidth + padding.left + padding.right} height={height}>
          {/* Grid lines */}
          {showGrid && yAxisLabels().map((label, idx) => (
            <Line
              key={`grid-${idx}`}
              x1={padding.left}
              y1={label.y}
              x2={padding.left + chartWidth}
              y2={label.y}
              stroke="#333"
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          ))}

          {/* Y-axis labels */}
          {yAxisLabels().map((label, idx) => (
            <SvgText
              key={`ylabel-${idx}`}
              x={padding.left - 10}
              y={label.y + 4}
              fontSize={11}
              fill="#888"
              textAnchor="end"
            >
              ${formatPrice(label.price)}
            </SvgText>
          ))}

          {/* Candlesticks */}
          {data.map((candle, index) => {
            const x = padding.left + index * totalCandleWidth + candleSpacing / 2;
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? bullishColor : bearishColor;

            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY) || 1;

            return (
              <G key={`candle-${index}`}>
                {/* High-Low wick */}
                <Line
                  x1={x + candleWidth / 2}
                  y1={highY}
                  x2={x + candleWidth / 2}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* Candle body */}
                <Rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBullish ? color : color}
                  stroke={color}
                  strokeWidth={1}
                  opacity={isBullish ? 0.8 : 1}
                />

                {/* X-axis label (every 3rd candle) */}
                {index % 3 === 0 && (
                  <SvgText
                    x={x + candleWidth / 2}
                    y={padding.top + priceChartHeight + 20}
                    fontSize={10}
                    fill="#888"
                    textAnchor="middle"
                    transform={`rotate(-45, ${x + candleWidth / 2}, ${padding.top + priceChartHeight + 20})`}
                  >
                    {formatTime(candle.timestamp)}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* Volume bars */}
          {showVolume && data.map((candle, index) => {
            const x = padding.left + index * totalCandleWidth + candleSpacing / 2;
            const volumeY = padding.top + priceChartHeight + 30;
            const vol = candle.volume || 0;
            const volBarHeight = (vol / maxVolume) * volumeHeight;
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? bullishColor : bearishColor;

            return (
              <Rect
                key={`volume-${index}`}
                x={x}
                y={volumeY + volumeHeight - volBarHeight}
                width={candleWidth}
                height={volBarHeight}
                fill={color}
                opacity={0.3}
              />
            );
          })}

          {/* Volume axis label */}
          {showVolume && (
            <SvgText
              x={padding.left - 10}
              y={padding.top + priceChartHeight + 40}
              fontSize={10}
              fill="#888"
              textAnchor="end"
            >
              Volume
            </SvgText>
          )}

          {/* Chart border */}
          <Rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={priceChartHeight}
            fill="none"
            stroke="#444"
            strokeWidth={1}
          />
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: bullishColor }]} />
            <Text style={styles.legendText}>Bullish (Close ≥ Open)</Text>
            <View style={[styles.legendDot, { backgroundColor: bearishColor, marginLeft: 20 }]} />
            <Text style={styles.legendText}>Bearish (Close &lt; Open)</Text>
          </View>
          <Text style={styles.legendSubtext}>
            {data.length} candles • Range: ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  legend: {
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  legendSubtext: {
    color: '#888',
    fontSize: 11,
  },
});

export default CandlestickChart;
