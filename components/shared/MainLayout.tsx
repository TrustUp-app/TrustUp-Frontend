import React, { ReactNode, useState, isValidElement, cloneElement } from 'react';
import { View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomBar } from './BottomBar';
import { Header } from './Header';
import { NotificationsPanel } from './NotificationsPanel';
import SettingsScreen from '../pages/SettingsScreen';
import LoanHistoryScreen from '../pages/LoanHistoryScreen';
import LoanDetailScreen from '../pages/LoanDetailScreen';
import ProfileScreen from '../pages/ProfileScreen';
import EditProfileScreen from '../pages/EditProfileScreen';
import { useProfile, getInitials } from '../../hooks/profile/use-profile';
import type { Loan } from '../../types/Loan';

interface MainLayoutProps {
  children: ReactNode;
  /** Called when the user disconnects the wallet or signs out. */
  onSignOut?: () => void;
}

/** Props injected into the direct child of MainLayout for loan-history navigation. */
interface PayScreenChildProps {
  onLoanHistoryPress?: () => void;
}

export const MainLayout = ({ children, onSignOut }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoanHistoryOpen, setIsLoanHistoryOpen] = useState(false);
  const [isLoanDetailOpen, setIsLoanDetailOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const { profile, isLoading, error, disconnectWallet, saveProfile } = useProfile();

  const handleLoanPress = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsLoanDetailOpen(true);
  };

  const handleLoanDetailBack = () => {
    setIsLoanDetailOpen(false);
    setSelectedLoan(null);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsProfileOpen(false);
    setIsSettingsOpen(false);
    onSignOut?.();
  };

  const handleSignOut = async () => {
    await disconnectWallet();
    setIsSettingsOpen(false);
    onSignOut?.();
  };

  // Any full-screen overlay hides the header/bottom bar
  const hasOverlay =
    isSettingsOpen || isLoanHistoryOpen || isLoanDetailOpen || isProfileOpen || isEditProfileOpen;

  // Inject callback into children so PayScreen can trigger navigation
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as React.ReactElement<PayScreenChildProps>, {
        onLoanHistoryPress: () => setIsLoanHistoryOpen(true),
      })
    : children;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}>
        <View className="flex-1 pb-[60px]">
          {!hasOverlay && (
            <Header
              displayName={profile?.displayName}
              avatarUrl={profile?.avatarUrl}
              initials={profile ? getInitials(profile.displayName) : undefined}
              onNotificationsPress={() => setIsNotificationsOpen(true)}
              onSettingsPress={() => setIsSettingsOpen(true)}
              onProfilePress={() => setIsProfileOpen(true)}
            />
          )}
          <ScrollView
            contentContainerClassName="flex-grow"
            className="flex-1"
            keyboardShouldPersistTaps="handled">
            {enhancedChildren}
          </ScrollView>
        </View>
        {!hasOverlay && (
          <View className="absolute bottom-0 left-0 right-0 z-10 h-[60px] bg-transparent">
            <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </View>
        )}

        {/* Settings Overlay */}
        {isSettingsOpen && (
          <View className="absolute inset-0 z-20">
            <SettingsScreen
              onBack={() => setIsSettingsOpen(false)}
              onProfilePress={() => {
                setIsSettingsOpen(false);
                setIsProfileOpen(true);
              }}
              onSignOut={handleSignOut}
            />
          </View>
        )}

        {/* Profile Overlay */}
        {isProfileOpen && (
          <View className="absolute inset-0 z-20">
            <ProfileScreen
              profile={profile}
              isLoading={isLoading}
              error={error}
              onBack={() => setIsProfileOpen(false)}
              onEditPress={() => setIsEditProfileOpen(true)}
              onDisconnect={handleDisconnect}
            />
          </View>
        )}

        {/* Edit Profile Overlay */}
        {isEditProfileOpen && (
          <View className="absolute inset-0 z-30">
            <EditProfileScreen
              profile={profile}
              onBack={() => setIsEditProfileOpen(false)}
              onSave={async (changes) => {
                await saveProfile(changes);
              }}
            />
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
