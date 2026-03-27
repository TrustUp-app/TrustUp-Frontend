import { View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ReactNode, useState } from 'react';
import { BottomBar } from './BottomBar';
import { Header } from './Header';
import { NotificationsPanel } from './NotificationsPanel';
import SettingsScreen from '../pages/SettingsScreen';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <View className="flex-1 pb-[60px]">
          <Header
            onNotificationsPress={() => setIsNotificationsOpen(true)}
            onSettingsPress={() => setIsSettingsOpen(true)}
          />
          <ScrollView
            contentContainerClassName="flex-grow"
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
        <View className="absolute left-0 right-0 bottom-0 h-[60px] bg-transparent z-10">
          <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <View className="absolute inset-0 z-20">
            <SettingsScreen onBack={() => setIsSettingsOpen(false)} />
          </View>
        )}

        {/* Notifications Overlay */}
        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
