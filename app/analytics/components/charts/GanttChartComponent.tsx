import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

export interface GanttTask {
  id: string;
  name: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  color?: string;
  symbol?: string; // for trading data
}

interface GanttChartProps {
  tasks: GanttTask[];
  width?: number;
  height?: number;
  barHeight?: number;
  showTimeline?: boolean;
  backgroundColor?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  width = 800,
  height = 400,
  barHeight = 40,
  showTimeline = true,
  backgroundColor = '#1a1a1a',
}) => {
  if (tasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor, height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  // Calculate time range
  const allTimes = tasks.flatMap(t => [t.startTime, t.endTime]);
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeRange = maxTime - minTime || 1;

  // Layout constants
  const labelWidth = 120;
  const chartWidth = width - labelWidth - 40;
  const padding = 20;
  const chartHeight = tasks.length * (barHeight + 10) + padding * 2;

  // Convert timestamp to x position
  const timeToX = (time: number) => {
    return labelWidth + ((time - minTime) / timeRange) * chartWidth;
  };

  // Format time for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  // Generate timeline markers
  const timelineMarkers = () => {
    const markers = [];
    const numMarkers = 5;
    for (let i = 0; i <= numMarkers; i++) {
      const time = minTime + (timeRange * i) / numMarkers;
      const x = timeToX(time);
      markers.push({ time, x });
    }
    return markers;
  };

  return (
    <ScrollView 
      horizontal 
      style={[styles.container, { backgroundColor }]}
      showsHorizontalScrollIndicator={true}
    >
      <View style={{ width: Math.max(width, 800) }}>
        <Svg width={Math.max(width, 800)} height={chartHeight + 60}>
          {/* Timeline */}
          {showTimeline && (
            <>
              {/* Timeline line */}
              <Line
                x1={labelWidth}
                y1={padding}
                x2={labelWidth + chartWidth}
                y2={padding}
                stroke="#444"
                strokeWidth={2}
              />
              
              {/* Timeline markers */}
              {timelineMarkers().map((marker, idx) => (
                <React.Fragment key={`marker-${idx}`}>
                  <Line
                    x1={marker.x}
                    y1={padding}
                    x2={marker.x}
                    y2={padding + 10}
                    stroke="#666"
                    strokeWidth={1}
                  />
                  <SvgText
                    x={marker.x}
                    y={padding - 5}
                    fontSize={10}
                    fill="#888"
                    textAnchor="middle"
                  >
                    {formatTime(marker.time)}
                  </SvgText>
                </React.Fragment>
              ))}
            </>
          )}

          {/* Tasks */}
          {tasks.map((task, index) => {
            const y = padding + 30 + index * (barHeight + 10);
            const startX = timeToX(task.startTime);
            const endX = timeToX(task.endTime);
            const barWidth = Math.max(endX - startX, 2);
            const color = task.color || '#00ffcc';

            return (
              <React.Fragment key={task.id}>
                {/* Task label */}
                <SvgText
                  x={10}
                  y={y + barHeight / 2 + 5}
                  fontSize={12}
                  fill="#fff"
                  fontWeight="600"
                >
                  {task.name}
                </SvgText>

                {/* Task bar */}
                <Rect
                  x={startX}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  opacity={0.8}
                  rx={4}
                />

                {/* Duration text */}
                {barWidth > 50 && (
                  <SvgText
                    x={startX + barWidth / 2}
                    y={y + barHeight / 2 + 5}
                    fontSize={10}
                    fill="#000"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {((task.endTime - task.startTime) / 1000).toFixed(1)}s
                  </SvgText>
                )}

                {/* Grid line */}
                <Line
                  x1={labelWidth}
                  y1={y + barHeight + 5}
                  x2={labelWidth + chartWidth}
                  y2={y + barHeight + 5}
                  stroke="#333"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Timeline View</Text>
          <Text style={styles.legendText}>
            Showing {tasks.length} active periods • Duration: {(timeRange / 1000).toFixed(1)}s
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  legend: {
    padding: 15,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  legendTitle: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendText: {
    color: '#888',
    fontSize: 12,
  },
});

export default GanttChart;
