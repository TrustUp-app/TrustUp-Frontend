import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const colors = require('../../theme/colors.json');

export type ToastType = 'success' | 'error';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  /** Auto-dismiss delay in ms. */
  duration?: number;
  onHide: () => void;
}

/**
 * Lightweight self-dismissing toast (no extra dependencies). Anchored to the
 * bottom above the safe-area inset and pointer-transparent so it never blocks
 * the UI underneath. Dismissal is timer-driven for reliability across targets.
 */
export const Toast = ({
  visible,
  message,
  type = 'success',
  duration = 2500,
  onHide,
}: ToastProps) => {
  const insets = useSafeAreaInsets();

  // Keep the latest onHide without making it an effect dependency, otherwise a
  // new onHide identity on each parent render would restart the dismiss timer.
  const onHideRef = useRef(onHide);
  useEffect(() => {
    onHideRef.current = onHide;
  }, [onHide]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onHideRef.current(), duration);
    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLabel={message}
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 24,
        zIndex: 100,
      }}>
      <View
        className="flex-row items-center gap-2 rounded-xl px-4 py-3 shadow-lg"
        style={{ backgroundColor: isSuccess ? colors.successDeep : colors.error }}>
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
          size={18}
          color={colors.white}
        />
        <Text className="flex-1 text-sm font-medium text-white">{message}</Text>
      </View>
    </View>
  );
};
