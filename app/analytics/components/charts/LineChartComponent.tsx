import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { LineChart as SVCLineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Circle, G, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';

// Extend ViewStyle to include width as string or number
type CustomViewStyle = ViewStyle & {
  width?: string | number;
  height?: string | number;
};

interface LineChartProps {
  data: number[];
  labels: string[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  lineColor?: string;
  highlightColor?: string;
  width?: number | string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  focusedIndex,
  onFocusChange,
  onSelect,
  lineColor = '#ff6f61',
  highlightColor = '#FFD700',
  width = '100%',
  height = 300,
}) => {
  const Decorator = ({ x, y, data }: any) => {
    // Calculate min/max for better label positioning
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    return data.map((value: number, index: number) => {
      const isFocused = index === focusedIndex;
      
      // Determine if label should be above or below point to avoid overlap
      const isNearTop = (value - minValue) / range > 0.7;
      const labelY = isNearTop ? y(value) + 25 : y(value) - 25;
      
      return (
        <G key={`point-${index}-${value}`}>
          <Circle
            cx={x(index)}
            cy={y(value)}
            r={isFocused ? 8 : 5}
            stroke={isFocused ? highlightColor : lineColor}
            strokeWidth={2}
            fill={isFocused ? highlightColor : 'white'}
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
              {typeof value === 'number' ? value.toFixed(2) : value}
            </SvgText>
          )}
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', paddingVertical: 16, width: '100%' }}>
        <YAxis
          data={data}
          contentInset={{ top: 40, bottom: 40 }}
          svg={{ fill: '#666', fontSize: 11 }}
          numberOfTicks={5}
          formatLabel={(value: any) => typeof value === 'number' ? value.toFixed(1) : value}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <SVCLineChart
            style={{ height, width: '100%' }}
            data={data}
            svg={{ stroke: lineColor, strokeWidth: 3 }}
            contentInset={{ top: 40, bottom: 40, left: 20, right: 20 }}
            curve={shape.curveNatural}
          >
            <Grid svg={{ stroke: '#e0e0e0', strokeWidth: 0.5, opacity: 0.5 }} />
            <Decorator />
          </SVCLineChart>

          <XAxis
            style={{ marginTop: 10, height: 30 }}
            data={labels}
            formatLabel={(value: number) => labels[value] || ''}
            contentInset={{ left: 20, right: 20 }}
            svg={{ fontSize: 10, fill: '#666', rotation: 0 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default LineChart;
