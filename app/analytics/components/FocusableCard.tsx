// components/FocusableCard.tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

export const FocusableCard = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      focusable={true}            // required for TV focus
      activeOpacity={1}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.card, focused && styles.focusedCard]}
    >
      <View>{children}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
    width: '90%',
    alignSelf: 'center',
  },
  focusedCard: {
    borderWidth: 3,
    borderColor: '#ff6f61',
  },
});
