import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

interface GaugeChartProps {
  value: number; // 0-100
  maxValue?: number;
  radius?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  unit?: string;
  dynamicColor?: boolean; // Auto-color based on value ranges
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  maxValue = 100,
  radius = 100,
  strokeWidth = 20,
  color,
  backgroundColor = '#2a2a2a',
  showValue = true,
  label,
  unit = '%',
  dynamicColor = false,
}) => {
  // Dynamic color based on value percentage
  const getColor = () => {
    if (color && !dynamicColor) return color;
    
    const percentage = (value / maxValue) * 100;
    if (percentage < 30) return '#00ff88'; // Green - Low
    if (percentage < 60) return '#ffd700'; // Yellow - Medium
    if (percentage < 80) return '#ff9500'; // Orange - High
    return '#ff3b30'; // Red - Critical
  };

  const gaugeColor = getColor();
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((value / maxValue) * circumference, circumference);
  const svgSize = radius * 2 + strokeWidth + 20;

  return (
    <View style={styles.container}>
      <Svg width={svgSize} height={svgSize}>
        <G rotation="-90" origin={`${svgSize / 2}, ${svgSize / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Arc */}
          <Circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress}, ${circumference}`}
            strokeLinecap="round"
          />
        </G>
        {/* Value Label */}
        {showValue && (
          <>
            <SvgText
              x={svgSize / 2}
              y={svgSize / 2 - 5}
              fontSize={36}
              fontWeight="bold"
              fill={gaugeColor}
              textAnchor="middle"
            >
              {value.toFixed(1)}
            </SvgText>
            <SvgText
              x={svgSize / 2}
              y={svgSize / 2 + 25}
              fontSize={16}
              fill="#888"
              textAnchor="middle"
            >
              {unit}
            </SvgText>
          </>
        )}
      </Svg>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GaugeChart;
