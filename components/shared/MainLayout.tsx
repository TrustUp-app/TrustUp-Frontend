import React, { ReactNode, useState } from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from './Header';
import SettingsScreen from '../pages/SettingsScreen';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}>
        <View className="flex-1">
          {!isSettingsOpen && (
            <Header
              onNotificationsPress={() => router.push('/notifications')}
              onSettingsPress={() => setIsSettingsOpen(true)}
            />
          )}
          {children}
        </View>

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <View className="absolute inset-0 z-20">
            <SettingsScreen onBack={() => setIsSettingsOpen(false)} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
