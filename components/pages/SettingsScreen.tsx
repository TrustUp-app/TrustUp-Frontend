import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
const colors = require('../../theme/colors.json');

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle: string;
}

const SettingsRow = ({ icon, iconBg, iconColor, label, subtitle }: SettingsRowProps) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className="flex-row items-center px-4 py-3"
    accessibilityRole="button"
    accessibilityLabel={label}>
    <View
      className="mr-3 h-9 w-9 items-center justify-center rounded-full"
      style={{ backgroundColor: iconBg }}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-semibold text-text">{label}</Text>
      <Text className="text-xs text-textMuted">{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
);

type SettingsSectionProps = React.PropsWithChildren<{
  title: string;
}>;

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <View className="mb-5">
    <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-textMuted">
      {title}
    </Text>
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {children}
    </View>
  </View>
);

interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center bg-white px-4 pb-4 pt-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-text">Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ACCOUNT */}
        <SettingsSection title="Account">
          <SettingsRow
            icon="person-outline"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label="Profile"
            subtitle="Manage your personal information"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="mail-outline"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label="Email"
            subtitle="Change your email address"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="call-outline"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label="Phone Number"
            subtitle="Update your contact number"
          />
        </SettingsSection>

        {/* PREFERENCES */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon="sunny-outline"
            iconBg={colors.amberSoft}
            iconColor={colors.amber}
            label="Dark Mode"
            subtitle="Switch between light and dark theme"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="notifications-outline"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label="Notifications"
            subtitle="Receive push notifications"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="finger-print-outline"
            iconBg={colors.successSoft}
            iconColor={colors.successDeep}
            label="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
          />
        </SettingsSection>

        {/* PAYMENT */}
        <SettingsSection title="Payment">
          <SettingsRow
            icon="card-outline"
            iconBg={colors.amberSoft}
            iconColor={colors.amber}
            label="Payment Methods"
            subtitle="Manage your cards and accounts"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="lock-closed-outline"
            iconBg={colors.primarySoft}
            iconColor={colors.primary}
            label="Auto Pay"
            subtitle="Automatically pay your loans"
          />
        </SettingsSection>

        {/* SUPPORT */}
        <SettingsSection title="Support">
          <SettingsRow
            icon="help-circle-outline"
            iconBg={colors.infoSoft}
            iconColor={colors.info}
            label="Help & Support"
            subtitle="Get help with your account"
          />
          <View className="mx-4 h-px bg-border" />
          <SettingsRow
            icon="shield-outline"
            iconBg={colors.successSoft}
            iconColor={colors.successDeep}
            label="Privacy Policy"
            subtitle="Read our privacy policy"
          />
        </SettingsSection>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
