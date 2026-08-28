import { useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/shared/Header';
import { useProfile, getInitials } from '../../hooks/profile/use-profile';

const colors = require('../../theme/colors.json');

export default function ProfileTab() {
  const router = useRouter();
  const { profile, isLoading, error, disconnectWallet } = useProfile();

  const handleSignOut = useCallback(async () => {
    await disconnectWallet();
    router.replace('/sign-in');
  }, [router, disconnectWallet]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color={colors.cta} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 items-center justify-center bg-background px-6">
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text className="mt-4 text-center text-base text-error">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 bg-background">
        <Header
          displayName={profile?.displayName}
          avatarUrl={profile?.avatarUrl}
          initials={profile ? getInitials(profile.displayName) : undefined}
          onNotificationsPress={() => router.push('/(tabs)/notifications')}
          onSettingsPress={() => {}}
          onProfilePress={() => {}}
        />

        <View className="flex-1 px-6 pt-6">
          <Text className="mb-6 text-2xl font-bold text-text">Profile</Text>

          {/* Profile Card */}
          <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-4 items-center">
              <View className="mb-3 h-24 w-24 items-center justify-center rounded-full bg-primarySoft">
                <Text className="text-3xl font-bold text-primary">
                  {profile ? getInitials(profile.displayName) : '?'}
                </Text>
              </View>
              <Text className="text-xl font-bold text-text">{profile?.displayName || 'Guest'}</Text>
              <Text className="mt-1 text-sm text-textMuted">@{profile?.username || 'unknown'}</Text>
            </View>

            {profile?.walletAddress && (
              <View className="rounded-xl bg-background p-4">
                <Text className="mb-1 text-xs text-textMuted">Wallet Address</Text>
                <Text className="font-mono text-sm text-text" numberOfLines={1}>
                  {profile.walletAddress}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            activeOpacity={0.7}>
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primarySoft">
                <Ionicons name="person-outline" size={20} color={colors.primary} />
              </View>
              <Text className="text-base font-medium text-text">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            activeOpacity={0.7}>
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amberSoft">
                <Ionicons name="settings-outline" size={20} color={colors.amber} />
              </View>
              <Text className="text-base font-medium text-text">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            activeOpacity={0.7}>
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-errorSoft">
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </View>
              <Text className="text-base font-medium text-error">Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
