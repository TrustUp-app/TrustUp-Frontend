import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

export type TabId = 'pay' | 'invest';

interface BottomBarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const BottomBar = ({ activeTab, setActiveTab }: BottomBarProps) => {
  const TABS = [
    { id: 'pay' as TabId, label: 'Pay', icon: 'wallet-outline', activeIcon: 'wallet' },
    { id: 'invest' as TabId, label: 'Invest', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  ] as const;

  return (
    <View className="border-t border-border bg-white px-2 py-3 shadow-lg">
      <View className="flex-row items-center justify-around">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 items-center justify-center py-2"
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}>
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? colors.text : colors.textMuted}
              />
              <Text
                className={`mt-1 text-[10px] font-medium ${isActive ? 'text-text' : 'text-textMuted'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
