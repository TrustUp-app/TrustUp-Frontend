import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

interface HeaderProps {
  displayName?: string;
  avatarUrl?: string | null;
  initials?: string;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
}

/**
 * Returns a time-of-day greeting:
 * morning 5–11, afternoon 12–17, evening 18–23, night 0–4.
 */
const getGreeting = (hour: number): string => {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 23) return 'Good evening';
  return 'Good night';
};

export const Header = ({
  displayName,
  avatarUrl,
  initials,
  onNotificationsPress,
  onSettingsPress,
  onProfilePress,
}: HeaderProps) => {
  const greeting = getGreeting(new Date().getHours());
  const firstName = displayName?.trim().split(/\s+/)[0];

  return (
    <View className="bg-white px-6 pb-4 pt-12">
      <View className="flex-row items-center justify-between">
        {/* Greetings */}
        <Text className="text-xl font-semibold text-text">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </Text>

        {/* Right icon */}
        <View className="flex-row items-center gap-4">
          {/* Settings icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={onSettingsPress}
            accessibilityLabel="Open Settings"
            accessibilityRole="button">
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Notifications icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={onNotificationsPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onProfilePress}
            accessibilityLabel="Open Profile"
            accessibilityRole="button">
            {avatarUrl ? (
              <View className="h-10 w-10 overflow-hidden rounded-full bg-gray-300">
                <Image source={{ uri: avatarUrl }} className="h-full w-full" />
              </View>
            ) : (
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.ctaSoft }}>
                <Text style={{ color: colors.cta, fontSize: 15, fontWeight: '700' }}>
                  {initials ?? '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
