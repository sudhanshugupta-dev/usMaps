import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  cardWidth?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  cardWidth = width * 0.4,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      focusable={true}
      activeOpacity={0.9}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.card,
        { width: cardWidth },
        focused && styles.focusedCard,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.chartContainer}>{children}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  focusedCard: {
    borderWidth: 4,
    borderColor: '#4f6cff',
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
