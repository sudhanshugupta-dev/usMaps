import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart as SVCLineChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

interface ScatterData {
  x: string | number;
  y: number;
}

interface ScatterChartProps {
  data: ScatterData[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  pointColor?: string;
  highlightColor?: string;
  height?: number;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  focusedIndex,
  onFocusChange,
  onSelect,
  pointColor = '#999',
  highlightColor = '#4f6cff',
  height = 300,
}) => {
  const yValues = data.map(d => d.y);
  const xLabels = data.map(d => d.x.toString());
  const chartWidth = Math.max(screenWidth - 100, data.length * 60);

  const Decorator = ({ x, y, data: chartData }: any) => {
    // Calculate min/max for better label positioning
    const minValue = Math.min(...chartData);
    const maxValue = Math.max(...chartData);
    const range = maxValue - minValue;
    
    return (
      <>
        {chartData.map((value: number, index: number) => {
          const isFocused = index === focusedIndex;
          
          // Determine if label should be above or below point
          const isNearTop = (value - minValue) / range > 0.7;
          const labelY = isNearTop ? y(value) + 20 : y(value) - 20;
          const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value);
          
          return (
            <G key={`scatter-${index}-${value}`}>
              <Circle
                cx={x(index)}
                cy={y(value)}
                r={isFocused ? 10 : 6}
                stroke={isFocused ? highlightColor : pointColor}
                strokeWidth={2}
                fill={isFocused ? highlightColor : '#fff'}
                opacity={isFocused ? 1 : 0.8}
              />
              {isFocused && (
                <SvgText
                  x={x(index)}
                  y={labelY}
                  fontSize={14}
                  fill="#fff"
                  fontWeight="bold"
                  alignmentBaseline="middle"
                  textAnchor="middle"
                  stroke="#000"
                  strokeWidth={0.5}
                >
                  {displayValue}
                </SvgText>
              )}
            </G>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ height, flexDirection: 'row', paddingVertical: 16, width: chartWidth }}>
          <YAxis
            data={yValues}
            contentInset={{ top: 30, bottom: 30 }}
            svg={{ fill: '#666', fontSize: 11 }}
            numberOfTicks={5}
            formatLabel={(value: any) => typeof value === 'number' ? value.toFixed(1) : value}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <SVCLineChart
              style={{ flex: 1 }}
              data={yValues}
              svg={{ stroke: 'transparent', strokeWidth: 0 }}
              contentInset={{ top: 30, bottom: 30 }}
            >
              <Grid svg={{ stroke: '#e0e0e0', strokeWidth: 0.5, opacity: 0.5 }} />
              <Decorator />
            </SVCLineChart>

          <XAxis
  style={{ marginTop: 10, height: 30 }}
  data={yValues}
  formatLabel={(value, index) => {
    if (!value && value !== 0) return '';

    if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) {
      return value.toExponential(1); // e.g. "2.3e-4"
    }

    // Show at most 2 decimal places
    return parseFloat(value.toFixed(2)).toString();
  }}
  contentInset={{ left: 20, right: 20 }}
  svg={{ fontSize: 10, fill: '#666' }}
/>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default ScatterChart;
