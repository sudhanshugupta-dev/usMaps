import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useScale } from '@/hooks/useScale';

export default function HomeScreen() {
  const router = useRouter();
  const scale = useScale();
  const styles = useHomeScreenStyles();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Map Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="map-marker-radius" 
            size={60 * scale} 
            color="#1E88E5" 
          />
        </View>

        {/* Title */}
        <ThemedText type="title" style={styles.title}>
          US Maps
        </ThemedText>

        {/* Description */}
        <ThemedText style={styles.description}>
          Explore interactive maps with multiple layers including satellite imagery, 
          political boundaries, demographics, and more.
        </ThemedText>

        {/* Enter Button */}
        <TouchableOpacity
          style={styles.enterButton}
          onPress={() => router.push('/maps')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="map" 
            size={24 * scale} 
            color="#FFFFFF" 
            style={styles.buttonIcon}
          />
          <ThemedText style={styles.buttonText}>
            Enter Maps Screen
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const useHomeScreenStyles = function () {
  const scale = useScale();
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20 * scale,
    },
    content: {
      width: '100%',
      maxWidth: 500 * scale,
      alignItems: 'center',
      padding: 32 * scale,
      borderRadius: 20 * scale,
      backgroundColor: 'rgba(30, 136, 229, 0.05)',
    },
    iconContainer: {
      width: 100 * scale,
      height: 100 * scale,
      borderRadius: 50 * scale,
      backgroundColor: 'rgba(30, 136, 229, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20 * scale,
      borderWidth: 3,
      borderColor: 'rgba(30, 136, 229, 0.2)',
    },
    title: {
      fontSize: 25 * scale,
      fontWeight: 'bold',
      marginBottom: 16 * scale,
      textAlign: 'center',
      color: '#0D47A1',
    },
    description: {
      fontSize: 16 * scale,
      textAlign: 'center',
      lineHeight: 24 * scale,
      marginBottom: 32 * scale,
      paddingHorizontal: 16 * scale,
      opacity: 0.8,
    },
    enterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1E88E5',
      paddingVertical: 16 * scale,
      paddingHorizontal: 40 * scale,
      borderRadius: 30 * scale,
      width: '100%',
      maxWidth: 320 * scale,
      shadowColor: '#1E88E5',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonIcon: {
      marginRight: 12 * scale,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18 * scale,
      fontWeight: 'bold',
    },
  });
};
