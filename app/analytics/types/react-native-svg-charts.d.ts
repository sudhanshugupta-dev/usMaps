declare module 'react-native-svg-charts' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface ChartProps<T = any> {
    data: T[];
    style?: StyleProp<ViewStyle>;
    contentInset?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    curve?: any;
    gridMin?: number;
    spacingInner?: number;
    spacingOuter?: number;
    svg?: any;
    children?: React.ReactNode;
  }

  export interface GridProps {
    direction?: any;
    svg?: any;
  }

  export interface XAxisProps<T = any> {
    data: T[];
    formatLabel?: (value: any, index?: any) => string | number;
    contentInset?: { left?: number; right?: number };
    style?: StyleProp<ViewStyle>;
    svg?: any;
  }

  export interface YAxisProps<T = any> {
    data: T[];
    formatLabel?: (value: any, index?: any) => string | number;
    contentInset?: { top?: number; bottom?: number };
    style?: StyleProp<ViewStyle>;
    svg?: any;
    numberOfTicks?: number;
  }

  export interface PieChartProps {
    data: any[];
    style?: StyleProp<ViewStyle>;
    innerRadius?: string | number;
    outerRadius?: string | number;
    padAngle?: number;
    children?: React.ReactNode;
  }

  export const LineChart: React.ComponentType<ChartProps>;
  export const BarChart: React.ComponentType<ChartProps>;
  export const AreaChart: React.ComponentType<ChartProps>;
  export const PieChart: React.ComponentType<PieChartProps>;
  export const Grid: React.ComponentType<GridProps> & {
    Direction: {
      HORIZONTAL: string;
      VERTICAL: string;
      BOTH: string;
    };
  };
  export const XAxis: React.ComponentType<XAxisProps>;
  export const YAxis: React.ComponentType<YAxisProps>;
}
