import { useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Preferences state for settings toggles
 */
export interface PrefsState {
  darkMode: boolean;
  notifications: boolean;
  biometric: boolean;
  autoPay: boolean;
}

/**
 * Animation state for a single toggle
 */
export interface ToggleAnimationState {
  anim: Animated.Value;
}

/**
 * Return type for the useSettingsScreen hook
 */
export interface UseSettingsScreenReturn {
  // Preferences state
  prefs: PrefsState;

  // Handlers
  togglePref: (key: keyof PrefsState) => void;

  // Animation factory for CustomToggle components
  createToggleAnimation: (initialValue: boolean) => ToggleAnimationState;
}

/**
 * Initial preferences state
 */
const initialPrefsState: PrefsState = {
  darkMode: false,
  notifications: true,
  biometric: false,
  autoPay: true,
};

/**
 * Custom hook for Settings Screen logic
 * Handles preferences state, toggle handlers, and animation setup
 */
export const useSettingsScreen = (): UseSettingsScreenReturn => {
  const [prefs, setPrefs] = useState<PrefsState>(initialPrefsState);

  // Toggle preference handler
  const togglePref = useCallback((key: keyof PrefsState) => {
    setPrefs((prev: PrefsState) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Factory function to create animation state for toggles
  const createToggleAnimation = useCallback((initialValue: boolean): ToggleAnimationState => {
    return {
      anim: new Animated.Value(initialValue ? 1 : 0),
    };
  }, []);

  return {
    prefs,
    togglePref,
    createToggleAnimation,
  };
};
