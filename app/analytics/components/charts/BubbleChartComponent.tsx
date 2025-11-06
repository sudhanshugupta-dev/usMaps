import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart as SVCLineChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { Circle, G, Text as SvgText } from 'react-native-svg';

interface BubbleData {
  x: string | number;
  y: number;
  size: number;
  label?: string;
}

interface BubbleChartProps {
  data: BubbleData[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  bubbleColor?: string;
  highlightColor?: string;
  width?: number | string;
  height?: number;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  focusedIndex,
  onFocusChange,
  onSelect,
  bubbleColor = '#8aa4ff',
  highlightColor = '#4f6cff',
  width = '100%',
  height = 300,
}) => {
  const yValues = data.map(d => d.y);
  const xLabels = data.map(d => d.x.toString());

  const Decorator = ({ x, y, data: chartData }: any) => (
    <>
      {chartData.map((value: number, index: number) => {
        const bubble = data[index];
        const isFocused = index === focusedIndex;
        const color = isFocused ? highlightColor : bubbleColor;
        const bubbleSize = bubble.size * (isFocused ? 2.0 : 1.4);

        return (
          <G key={index}>
            <Circle
              cx={x(index)}
              cy={y(value)}
              r={bubbleSize}
              fill={color}
              stroke="#fff"
              strokeWidth={2}
              onPress={() => onSelect && onSelect(index)}
            />
            {isFocused && (
              <SvgText
                x={x(index)}
                y={y(value) - bubbleSize - 8}
                fontSize={12}
                fill="#333"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {bubble.label || `Y: ${bubble.y}`}
              </SvgText>
            )}
          </G>
        );
      })}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', paddingVertical: 16, width: '100%' }}>
        <YAxis
          data={yValues}
          contentInset={{ top: 20, bottom: 20 }}
          svg={{ fill: '#333', fontSize: 12 }}
          numberOfTicks={5}
          formatLabel={(value: any) => `${value}`}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <SVCLineChart
            style={{ height, width: '100%' }}
            data={yValues}
            svg={{ stroke: 'transparent', strokeWidth: 0 }}
            contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          >
            <Grid svg={{ stroke: '#e0e0e0' }} />
            <Decorator />
          </SVCLineChart>

          <XAxis
            style={{ marginTop: 10, height: 20 }}
            data={xLabels}
            formatLabel={(value: number) => xLabels[value]}
            contentInset={{ left: 10, right: 10 }}
            svg={{ fontSize: 12, fill: '#333' }}
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

export default BubbleChart;
