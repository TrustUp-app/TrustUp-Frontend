import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomBar, type TabId } from './BottomBar';
import { Header } from './Header';
import { NotificationsPanel } from './NotificationsPanel';
import { Toast } from './Toast';
import SettingsScreen from '../pages/SettingsScreen';
import LoanHistoryScreen from '../pages/LoanHistoryScreen';
import LoanDetailScreen from '../pages/LoanDetailScreen';
import ReputationScreen from '../pages/ReputationScreen';
import MerchantsScreen from '../pages/MerchantsScreen';
import MerchantDetailScreen from '../pages/MerchantDetailScreen';
import ProfileScreen from '../pages/ProfileScreen';
import EditProfileScreen from '../pages/EditProfileScreen';
import PayScreen from '../pages/pay/PayScreen';
import InvestScreen from '../pages/InvestScreen';
import { useProfile, getInitials } from '../../hooks/profile/use-profile';
import { useNotifications } from '../../hooks/notifications/use-notifications';
import type { Loan } from '../../types/Loan';
import type { MerchantSummary } from '../../types/api';

interface MainLayoutProps {
  onSignOut?: () => void;
}

export const MainLayout = ({ onSignOut }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('pay');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoanHistoryOpen, setIsLoanHistoryOpen] = useState(false);
  const [isLoanDetailOpen, setIsLoanDetailOpen] = useState(false);
  const [isReputationOpen, setIsReputationOpen] = useState(false);
  const [isMerchantsOpen, setIsMerchantsOpen] = useState(false);
  const [isMerchantDetailOpen, setIsMerchantDetailOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { profile, isLoading, error, disconnectWallet, saveProfile } = useProfile();
  const { unreadCount } = useNotifications();

  const handleLoanPress = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsLoanDetailOpen(true);
  };

  const handleLoanDetailBack = () => {
    setIsLoanDetailOpen(false);
    setSelectedLoan(null);
  };

  const handleMerchantPress = (merchant: MerchantSummary) => {
    setSelectedMerchant(merchant);
    setIsMerchantDetailOpen(true);
  };

  const handleMerchantDetailBack = () => {
    setIsMerchantDetailOpen(false);
    setSelectedMerchant(null);
  };

  // No dedicated loan-application screen exists yet — return to the base
  // screen (where the BNPL purchase flow lives) and confirm the selection.
  const handleStartPurchase = (merchant: MerchantSummary) => {
    setIsMerchantDetailOpen(false);
    setIsMerchantsOpen(false);
    setSelectedMerchant(null);
    setToastMessage(`Selected ${merchant.name} — continue your BNPL purchase below`);
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
    isSettingsOpen ||
    isLoanHistoryOpen ||
    isLoanDetailOpen ||
    isReputationOpen ||
    isMerchantsOpen ||
    isMerchantDetailOpen ||
    isProfileOpen ||
    isEditProfileOpen;

  const baseScreen =
    activeTab === 'pay' ? (
      <PayScreen
        onLoanHistoryPress={() => setIsLoanHistoryOpen(true)}
        onViewReputationPress={() => setIsReputationOpen(true)}
        onExploreMerchantsPress={() => setIsMerchantsOpen(true)}
        onToast={(message: string) => setToastMessage(message)}
      />
    ) : (
      <InvestScreen />
    );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-background">
        <View className="flex-1 pb-[60px]">
          {!hasOverlay && (
            <Header
              displayName={profile?.displayName}
              avatarUrl={profile?.avatarUrl}
              initials={profile ? getInitials(profile.displayName) : undefined}
              unreadNotificationsCount={unreadCount}
              onNotificationsPress={() => setIsNotificationsOpen(true)}
              onSettingsPress={() => setIsSettingsOpen(true)}
              onProfilePress={() => setIsProfileOpen(true)}
            />
          )}

          <View className="flex-1">{baseScreen}</View>
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

        {/* Reputation Overlay */}
        {isReputationOpen && (
          <View className="absolute inset-0 z-20">
            <ReputationScreen onBack={() => setIsReputationOpen(false)} />
          </View>
        )}

        {/* Merchants Overlay */}
        {isMerchantsOpen && (
          <View className="absolute inset-0 z-20">
            <MerchantsScreen
              onBack={() => setIsMerchantsOpen(false)}
              onMerchantPress={handleMerchantPress}
            />
          </View>
        )}

        {/* Merchant Detail Overlay */}
        {isMerchantDetailOpen && selectedMerchant && (
          <View className="absolute inset-0 z-30">
            <MerchantDetailScreen
              merchant={selectedMerchant}
              onBack={handleMerchantDetailBack}
              onStartPurchasePress={handleStartPurchase}
            />
          </View>
        )}

        {/* Notifications Overlay */}
        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        {/* App-level toast host */}
        <Toast
          visible={toastMessage !== null}
          message={toastMessage ?? ''}
          type="success"
          onHide={() => setToastMessage(null)}
        />
      </View>
    </SafeAreaView>
  );
};
