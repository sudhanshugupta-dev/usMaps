import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PieChart as SVCPieChart } from 'react-native-svg-charts';
import { Text as SvgText } from 'react-native-svg';

interface DonutChartData {
  value: number;
  label: string;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onSelect?: (index: number) => void;
  height?: number;
  innerRadius?: string;
  outerRadius?: string;
  showLabels?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  focusedIndex,
  onFocusChange,
  onSelect,
  height = 300,
  innerRadius = '50%',
  outerRadius = '90%',
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
        innerRadius={innerRadius}
        outerRadius={outerRadius}
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

export default DonutChart;
