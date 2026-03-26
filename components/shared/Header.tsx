import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

interface HeaderProps {
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
}

export const Header = ({ onNotificationsPress, onSettingsPress }: HeaderProps) => {
  return (
    <View className="bg-white px-6 pb-4 pt-12">
      <View className="flex-row items-center justify-between">
        {/* Greetings */}
        <Text className="text-xl font-semibold text-text">Good evening, Josué</Text>

        {/* Right icon */}
        <View className="flex-row items-center gap-4">
          {/* Settings icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={onSettingsPress}
            accessibilityLabel="Open Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Notifications icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={onNotificationsPress}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity activeOpacity={0.7}>
            <View className="h-10 w-10 overflow-hidden rounded-full bg-gray-300">
              <Image source={{ uri: 'https://via.placeholder.com/40' }} className="h-full w-full" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
