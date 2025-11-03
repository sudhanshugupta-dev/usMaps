/**
 * Custom TV Focus Hook
 * Manages TV remote D-pad navigation and focus states
 */

import { useEffect, useCallback, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

export interface TVFocusConfig {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onSelect?: () => void;
  onBack?: () => boolean; // Return true to prevent default back behavior
  onChannelUp?: () => void; // For zoom in
  onChannelDown?: () => void; // For zoom out
  enabled?: boolean;
}

/**
 * Hook to handle TV remote control events
 */
export const useTVFocus = (config: TVFocusConfig) => {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onSelect,
    onBack,
    onChannelUp,
    onChannelDown,
    enabled = true,
  } = config;

  useEffect(() => {
    if (!enabled) return;

    let tvEventHandler: any = null;

    // Handle hardware back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (onBack) {
          return onBack();
        }
        return false;
      }
    );

    // For TV platforms, handle D-pad events using HWEvent listener
    if (Platform.isTV || Platform.OS === 'android') {
      const handleTVEvent = (evt: any) => {
        const { eventType } = evt;
        
        console.log('[useTVFocus] TV Event:', eventType);

        switch (eventType) {
          case 'up':
            console.log('[useTVFocus] UP pressed');
            onUp?.();
            break;
          case 'down':
            console.log('[useTVFocus] DOWN pressed');
            onDown?.();
            break;
          case 'left':
            console.log('[useTVFocus] LEFT pressed');
            onLeft?.();
            break;
          case 'right':
            console.log('[useTVFocus] RIGHT pressed');
            onRight?.();
            break;
          case 'select':
          case 'playPause':
            console.log('[useTVFocus] SELECT pressed');
            onSelect?.();
            break;
          case 'channelUp':
          case 'fastForward':
            console.log('[useTVFocus] CHANNEL UP / ZOOM IN pressed');
            onChannelUp?.();
            break;
          case 'channelDown':
          case 'rewind':
            console.log('[useTVFocus] CHANNEL DOWN / ZOOM OUT pressed');
            onChannelDown?.();
            break;
          default:
            console.log('[useTVFocus] Unknown event:', eventType);
            break;
        }
      };

      // Try to use TVEventHandler.addListener (react-native-tvos API)
      try {
        const RN = require('react-native');
        if (RN.TVEventHandler && RN.TVEventHandler.addListener) {
          tvEventHandler = RN.TVEventHandler.addListener(handleTVEvent);
          console.log('[useTVFocus] TV Event Handler enabled via addListener');
        } else {
          console.log('[useTVFocus] TVEventHandler.addListener not available');
        }
      } catch (error) {
        console.log('[useTVFocus] TVEventHandler not available:', error);
      }
    }
    
    return () => {
      backHandler.remove();
      if (tvEventHandler) {
        try {
          // TVEventHandler.addListener returns a subscription with remove()
          if (typeof tvEventHandler.remove === 'function') {
            tvEventHandler.remove();
            console.log('[useTVFocus] TV Event Handler removed');
          } else if (typeof tvEventHandler.disable === 'function') {
            tvEventHandler.disable();
            console.log('[useTVFocus] TV Event Handler disabled');
          }
        } catch (error) {
          console.log('[useTVFocus] Error removing handler:', error);
        }
      }
    };
  }, [enabled, onUp, onDown, onLeft, onRight, onSelect, onBack, onChannelUp, onChannelDown]);

  return {
    handleUp: useCallback(() => enabled && onUp?.(), [enabled, onUp]),
    handleDown: useCallback(() => enabled && onDown?.(), [enabled, onDown]),
    handleLeft: useCallback(() => enabled && onLeft?.(), [enabled, onLeft]),
    handleRight: useCallback(() => enabled && onRight?.(), [enabled, onRight]),
    handleSelect: useCallback(() => enabled && onSelect?.(), [enabled, onSelect]),
  };
};

/**
 * Hook to manage focus state for a focusable component
 */
export const useFocusable = (isFocused: boolean) => {
  const focusedRef = useRef(isFocused);

  useEffect(() => {
    focusedRef.current = isFocused;
  }, [isFocused]);

  return {
    isFocused: focusedRef.current,
    focusStyle: isFocused ? styles.focused : {},
  };
};

// Focus effect styles
const styles = {
  focused: {
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
};
