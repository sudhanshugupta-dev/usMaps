import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { WeatherLocation, CurrentWeather } from '../types/weather';

interface WeatherHeaderProps {
  location: WeatherLocation;
  current: CurrentWeather;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({ location, current }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.cityName}>{location.name}</Text>
        <Text style={styles.region}>
          {location.region}, {location.country}
        </Text>
        <Text style={styles.localTime}>{location.localtime}</Text>
      </View>

      <View style={styles.centerSection}>
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{current.temperature}°</Text>
          <View style={styles.weatherInfo}>
            {current.weather_icons && current.weather_icons[0] && (
              <Image
                source={{ uri: current.weather_icons[0] }}
                style={styles.weatherIcon}
              />
            )}
            <Text style={styles.weatherDescription}>
              {current.weather_descriptions[0]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Feels Like:</Text>
          <Text style={styles.statValue}>{current.feelslike}°</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Humidity:</Text>
          <Text style={styles.statValue}>{current.humidity}%</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Wind:</Text>
          <Text style={styles.statValue}>
            {current.wind_speed} km/h {current.wind_dir}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>UV Index:</Text>
          <Text style={styles.statValue}>{current.uv_index}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    padding: 25,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  region: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 8,
  },
  localTime: {
    fontSize: 14,
    color: '#c7d2fe',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 80,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  weatherIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#c7d2fe',
    marginRight: 8,
  },
  statValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});
