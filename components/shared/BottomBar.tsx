import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomBar = ({ activeTab, setActiveTab }: BottomBarProps) => {
  const TABS = [
    { id: 'cards', icon: 'card-outline', activeIcon: 'card' },
    { id: 'analytics', icon: 'trending-up', activeIcon: 'trending-up' },
  ] as const;

  return (
    <View className="border-t border-[#EBEBEB] bg-white px-2 py-3 shadow-lg">
      <View className="flex-row items-center justify-around">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName = isActive ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 items-center justify-center py-2"
              activeOpacity={0.7}>
              <Ionicons name={iconName} size={24} color={isActive ? '#343434' : '#8E8E8E'} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
