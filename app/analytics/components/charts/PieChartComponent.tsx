import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PieChart as SVCPieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';

export interface PieChartData {
  value: number;
  label: string;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  height?: number;
  showLabels?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  focusedIndex,
  onFocusChange,
  onSelect,
  height = 300,
  showLabels = true,
}) => {
  const pieData = data.map((item, index) => ({
    value: item.value,
    svg: {
      fill: item.color,
      onPress: () => onSelect && onSelect(index),
    },
    key: `slice-${index}`,
  }));

  const Labels = ({ slices }: any) => {
    return showLabels
      ? slices.map((slice: any, index: number) => {
          const { labelCentroid } = slice;
          const isFocused = index === focusedIndex;
          const fontSize = isFocused ? 16 : 12;
          return (
            <SvgText
              key={index}
              x={labelCentroid[0]}
              y={labelCentroid[1]}
              fill={'#fff'}
              fontSize={fontSize}
              fontWeight={isFocused ? 'bold' : 'normal'}
              alignmentBaseline={'middle'}
              textAnchor={'middle'}
            >
              {data[index].label}
            </SvgText>
          );
        })
      : null;
  };

  return (
    <View style={styles.container}>
      <SVCPieChart
        style={{ height, width: '100%' }}
        data={pieData}
        innerRadius={'0%'}
        outerRadius={'90%'}
      >
        <Labels />
      </SVCPieChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PieChart;
