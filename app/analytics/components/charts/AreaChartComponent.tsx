import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { AreaChart as SVCAreaChart, XAxis, YAxis, Grid } from 'react-native-svg-charts';
import { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as shape from 'd3-shape';

interface AreaChartProps {
  data: number[];
  labels: string[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  areaColor?: string;
  highlightColor?: string;
  width?: number | string;
  height?: number;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  labels,
  focusedIndex,
  onFocusChange,
  onSelect,
  areaColor = '#ff6f61',
  highlightColor = '#4f6cff',
  width = '100%',
  height = 300,
}) => {
  const Decorator = ({ x, y, data }: any) =>
    data.map((value: number, index: number) => (
      <Circle
        key={index}
        cx={x(index)}
        cy={y(value)}
        r={index === focusedIndex ? 7 : 4}
        stroke={index === focusedIndex ? highlightColor : areaColor}
        strokeWidth={2}
        fill={index === focusedIndex ? highlightColor : '#fff'}
      />
    ));

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', paddingVertical: 16, width: '100%' }}>
        <YAxis
          data={data}
          contentInset={{ top: 20, bottom: 20 }}
          svg={{ fill: '#333', fontSize: 12 }}
          numberOfTicks={5}
          formatLabel={(value: any) => `${value}`}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <SVCAreaChart
            style={{ height, width: '100%' }}
            data={data}
            svg={{
              fill: 'url(#gradient)',
              stroke: areaColor,
              strokeWidth: 2,
            }}
            contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
            curve={shape.curveNatural}
          >
            <Grid svg={{ stroke: '#e0e0e0' }} />
            <Defs key={'gradient'}>
              <LinearGradient id={'gradient'} x1={'0'} y1={'0'} x2={'0'} y2={'1'}>
                <Stop offset={'0%'} stopColor={areaColor} stopOpacity={0.8} />
                <Stop offset={'100%'} stopColor={areaColor} stopOpacity={0.1} />
              </LinearGradient>
            </Defs>
            <Decorator />
          </SVCAreaChart>

          <XAxis
            style={{ marginTop: 10, height: 20 }}
            data={labels}
            formatLabel={(value: number) => labels[value]}
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

export default AreaChart;
