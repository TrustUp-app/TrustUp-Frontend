import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMerchants } from '../../hooks/merchants/use-merchants';
import type { MerchantSummary } from '../../types/api';

const colors = require('../../theme/colors.json');

// ─── Sub-components ─────────────────────────────────────────────────────────

const MerchantCard = ({ merchant }: { merchant: MerchantSummary }) => (
  <View
    className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
    accessibilityLabel={`${merchant.name}, ${merchant.category}`}>
    <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primarySoft">
      {merchant.logo ? (
        <Image source={{ uri: merchant.logo }} className="h-full w-full" resizeMode="cover" />
      ) : (
        <Ionicons name="storefront-outline" size={22} color={colors.primary} />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-text" numberOfLines={1}>
        {merchant.name}
      </Text>
      <Text className="text-xs text-textMuted">{merchant.category}</Text>
    </View>
    {merchant.isActive && (
      <View className="rounded-full bg-successSoft px-3 py-1">
        <Text className="text-xs font-semibold text-successDeep">Active</Text>
      </View>
    )}
  </View>
);

const ComingSoonState = () => (
  <View className="flex-1 items-center justify-center px-8 pt-24">
    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name="storefront-outline" size={32} color={colors.textSubtle} />
    </View>
    <Text className="mb-1 text-base font-semibold text-text">Merchants coming soon</Text>
    <Text className="text-center text-sm leading-5 text-textSecondary">
      We&apos;re onboarding merchants that accept Buy Now, Pay Later.{'\n'}Check back shortly.
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface MerchantsScreenProps {
  onBack: () => void;
}

const MerchantsScreen: React.FC<MerchantsScreenProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { merchants, isLoading, error, refresh } = useMerchants();

  const showComingSoon = !isLoading && !error && merchants.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.white,
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-white">
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">Merchants</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Error banner */}
        {error && (
          <View className="mb-3 flex-row items-center gap-2 rounded-xl bg-errorSoft px-4 py-3">
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text className="flex-1 text-sm text-error">{error}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text className="text-sm font-semibold text-error">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Merchant list */}
        {merchants.map((merchant) => (
          <MerchantCard key={merchant.id} merchant={merchant} />
        ))}

        {/* Loading */}
        {isLoading && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Coming soon / empty */}
        {showComingSoon && <ComingSoonState />}
      </ScrollView>
    </View>
  );
};

export default MerchantsScreen;
