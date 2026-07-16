import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

const colors = require('../../theme/colors.json');

type TabIconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<string, { focused: TabIconName; unfocused: TabIconName }> = {
  index: { focused: 'home', unfocused: 'home-outline' },
  pay: { focused: 'card', unfocused: 'card-outline' },
  notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
  profile: { focused: 'person', unfocused: 'person-outline' },
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icon = tabIcons[route.name] ?? tabIcons.index;
          return (
            <Ionicons name={focused ? icon.focused : icon.unfocused} size={size} color={color} />
          );
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="pay" options={{ title: 'Pay' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
