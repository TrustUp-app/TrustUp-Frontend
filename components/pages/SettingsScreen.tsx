import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/Navigation';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
}

const SettingsRow = ({ icon, title, subtitle }: SettingsRowProps) => (
  <View className="flex-row items-center px-4 py-4">
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E6]">
      <Ionicons name={icon} size={20} color="#FF9C42" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-[#343434]">{title}</Text>
      <Text className="text-sm text-[#8E8E8E]">{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
  </View>
);

interface SettingsToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const SettingsToggleRow = ({ icon, title, subtitle, value, onValueChange }: SettingsToggleRowProps) => (
  <View className="flex-row items-center px-4 py-4">
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E6]">
      <Ionicons name={icon} size={20} color="#FF9C42" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-[#343434]">{title}</Text>
      <Text className="text-sm text-[#8E8E8E]">{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#D1D1D6', true: '#FF9C42' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#D1D1D6"
    />
  </View>
);

const Divider = () => <View className="ml-[72px] mr-4 h-px bg-[#F2F2F7]" />;

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsNavigationProp>();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 pb-2 pt-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          activeOpacity={0.7}
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color="#343434" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-[#343434]">Settings</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ACCOUNT */}
        <Text className="px-6 pb-2 pt-5 text-xs font-semibold uppercase tracking-widest text-[#8E8E8E]">
          Account
        </Text>
        <View className="mx-4 overflow-hidden rounded-2xl bg-white">
          <SettingsRow icon="person-outline" title="Profile" subtitle="Manage your personal information" />
          <Divider />
          <SettingsRow icon="mail-outline" title="Email" subtitle="Change your email address" />
          <Divider />
          <SettingsRow icon="call-outline" title="Phone Number" subtitle="Update your contact number" />
        </View>

        {/* PREFERENCES */}
        <Text className="px-6 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-[#8E8E8E]">
          Preferences
        </Text>
        <View className="mx-4 overflow-hidden rounded-2xl bg-white">
          <SettingsToggleRow
            icon="sunny-outline"
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <Divider />
          <SettingsToggleRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Receive push notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <Divider />
          <SettingsToggleRow
            icon="shield-outline"
            title="Biometric Authentication"
            subtitle="Use fingerprint or face ID"
            value={biometrics}
            onValueChange={setBiometrics}
          />
        </View>

        {/* PAYMENT */}
        <Text className="px-6 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-[#8E8E8E]">
          Payment
        </Text>
        <View className="mx-4 overflow-hidden rounded-2xl bg-white">
          <SettingsRow icon="card-outline" title="Payment Methods" subtitle="Manage your cards and accounts" />
          <Divider />
          <SettingsToggleRow
            icon="lock-closed-outline"
            title="Auto Pay"
            subtitle="Automatically pay your loans"
            value={autoPay}
            onValueChange={setAutoPay}
          />
        </View>

        {/* SUPPORT */}
        <Text className="px-6 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-[#8E8E8E]">
          Support
        </Text>
        <View className="mx-4 overflow-hidden rounded-2xl bg-white">
          <SettingsRow icon="help-circle-outline" title="Help & Support" subtitle="Get help with your account" />
          <Divider />
          <SettingsRow icon="document-text-outline" title="Privacy Policy" subtitle="Read our privacy policy" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
