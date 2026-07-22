import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { truncateWallet, getInitials } from '../../hooks/profile/use-profile';
import type { UserProfile } from '../../types/User';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

interface ProfileScreenProps {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onEditPress: () => void;
  /** Disconnects the wallet (clears token) then notifies the root to sign out. */
  onDisconnect: () => void;
}

const formatMemberSince = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const StatCell: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{value}</Text>
    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
      {label}
    </Text>
  </View>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  isLoading,
  error,
  onBack,
  onEditPress,
  onDisconnect,
}) => {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = useCallback(async () => {
    if (!profile?.walletAddress) return;
    await Clipboard.setStringAsync(profile.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [profile?.walletAddress]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.settingsBg }}>
      {/* Header strip */}
      <View
        style={{
          backgroundColor: colors.settingsBg,
          paddingHorizontal: 16,
          paddingTop: insets.top + 24,
          paddingBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Profile</Text>
      </View>

      {isLoading && !profile ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.cta} />
        </View>
      ) : error && !profile ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text
            style={{ color: colors.textMuted, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      ) : profile ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}>
          {/* Identity card */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              alignItems: 'center',
              paddingVertical: 24,
              paddingHorizontal: 20,
              marginTop: 8,
            }}>
            {/* Avatar or initials */}
            {profile.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.border }}
              />
            ) : (
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: colors.ctaSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: colors.cta, fontSize: 30, fontWeight: '700' }}>
                  {getInitials(profile.displayName)}
                </Text>
              </View>
            )}

            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 14 }}>
              {profile.displayName}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>
              @{profile.username}
            </Text>

            {/* Wallet address + copy */}
            <TouchableOpacity
              onPress={handleCopyWallet}
              activeOpacity={0.7}
              accessibilityLabel="Copy wallet address"
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: colors.settingsBg,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginTop: 16,
              }}>
              <Ionicons name="wallet-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                {truncateWallet(profile.walletAddress)}
              </Text>
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copied ? colors.success : colors.cta}
              />
            </TouchableOpacity>
          </View>

          {/* Reputation */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              padding: 20,
              marginTop: 16,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
              <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>
                Reputation score
              </Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                {profile.reputationScore}
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500' }}>
                  {' '}
                  / 100
                </Text>
              </Text>
            </View>
            <View
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.settingsBg,
                marginTop: 12,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  width: `${Math.max(0, Math.min(100, profile.reputationScore))}%`,
                  height: '100%',
                  borderRadius: 5,
                  backgroundColor: colors.success,
                }}
              />
            </View>
          </View>

          {/* Stats row */}
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 12,
              marginTop: 16,
              flexDirection: 'row',
            }}>
            <StatCell value={String(profile.totalLoans)} label="Total loans" />
            <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
            <StatCell
              value={`$${profile.totalDeposited.toLocaleString()}`}
              label="Total deposited"
            />
            <View style={{ width: 1, backgroundColor: colors.borderSubtle }} />
            <StatCell value={formatMemberSince(profile.memberSince)} label="Member since" />
          </View>

          {/* Edit profile */}
          <TouchableOpacity
            onPress={onEditPress}
            activeOpacity={0.85}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            style={{
              backgroundColor: colors.cta,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 24,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}>
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          {/* Disconnect wallet */}
          <TouchableOpacity
            onPress={onDisconnect}
            activeOpacity={0.85}
            accessibilityLabel="Disconnect wallet"
            accessibilityRole="button"
            style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: colors.errorSoft,
            }}>
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: 16, fontWeight: '700' }}>
              Disconnect Wallet
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
};

export default ProfileScreen;
