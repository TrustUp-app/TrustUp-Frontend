import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

export type MainTab = 'pay' | 'invest';

interface BottomBarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
}

interface TabConfig {
  id: MainTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

export const BottomBar = ({ activeTab, setActiveTab }: BottomBarProps) => {
  const TABS: TabConfig[] = [
    { id: 'pay', label: 'Pay', icon: 'card-outline', activeIcon: 'card' },
    { id: 'invest', label: 'Invest', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  ];

  return (
    <View
      className="border-t border-border bg-white px-2 py-2 shadow-lg"
      accessibilityRole="tablist">
      <View className="flex-row items-center justify-around">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 items-center justify-center py-1"
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              testID={`tab-${tab.id}`}>
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                className="mt-0.5 text-xs font-medium"
                style={{ color: isActive ? colors.primary : colors.textMuted }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
