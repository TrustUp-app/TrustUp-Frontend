import { View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ReactNode, useState, isValidElement, cloneElement } from 'react';
import { BottomBar } from './BottomBar';
import { Header } from './Header';
import { NotificationsPanel } from './NotificationsPanel';
import SettingsScreen from '../pages/SettingsScreen';
import LoanHistoryScreen from '../pages/LoanHistoryScreen';
import LoanDetailScreen from '../pages/LoanDetailScreen';
import type { Loan } from '../../types/Loan';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoanHistoryOpen, setIsLoanHistoryOpen] = useState(false);
  const [isLoanDetailOpen, setIsLoanDetailOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const handleLoanPress = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsLoanDetailOpen(true);
  };

  const handleLoanDetailBack = () => {
    setIsLoanDetailOpen(false);
    setSelectedLoan(null);
  };

  // Any full-screen overlay hides the header/bottom bar
  const hasOverlay = isSettingsOpen || isLoanHistoryOpen || isLoanDetailOpen;

  // Inject callback into children so PayScreen can trigger navigation
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        onLoanHistoryPress: () => setIsLoanHistoryOpen(true),
      })
    : children;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <View className="flex-1 pb-[60px]">
          {!hasOverlay && (
            <Header
              onNotificationsPress={() => setIsNotificationsOpen(true)}
              onSettingsPress={() => setIsSettingsOpen(true)}
            />
          )}
          <ScrollView
            contentContainerClassName="flex-grow"
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {enhancedChildren}
          </ScrollView>
        </View>
        {!hasOverlay && (
          <View className="absolute left-0 right-0 bottom-0 h-[60px] bg-transparent z-10">
            <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </View>
        )}

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <View className="absolute inset-0 z-20">
            <SettingsScreen onBack={() => setIsSettingsOpen(false)} />
          </View>
        )}

        {/* Loan History Overlay */}
        {isLoanHistoryOpen && (
          <View className="absolute inset-0 z-20">
            <LoanHistoryScreen
              onBack={() => setIsLoanHistoryOpen(false)}
              onLoanPress={handleLoanPress}
            />
          </View>
        )}

        {/* Loan Detail Overlay */}
        {isLoanDetailOpen && selectedLoan && (
          <View className="absolute inset-0 z-30">
            <LoanDetailScreen loan={selectedLoan} onBack={handleLoanDetailBack} />
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
