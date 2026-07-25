import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMerchantDetail } from '../../hooks/merchants/use-merchant-detail';
import type { MerchantSummary } from '../../types/api';

const colors = require('../../theme/colors.json');

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between border-b border-borderSubtle py-3">
    <Text className="text-sm text-textMuted">{label}</Text>
    <Text className="text-sm font-medium text-textStrong" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

interface MerchantDetailScreenProps {
  merchant: MerchantSummary;
  onBack: () => void;
  onStartPurchasePress: (merchant: MerchantSummary) => void;
}

const MerchantDetailScreen: React.FC<MerchantDetailScreenProps> = ({
  merchant,
  onBack,
  onStartPurchasePress,
}) => {
  const insets = useSafeAreaInsets();
  const { merchant: detail, isLoading, error, refresh } = useMerchantDetail(merchant.id);

  const logo = detail?.logo || merchant.logo;
  const category = detail?.category || merchant.category;

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
          <Text className="flex-1 text-xl font-bold text-text" numberOfLines={1}>
            {merchant.name}
          </Text>
          {merchant.isActive && (
            <View className="rounded-full bg-successSoft px-3 py-1">
              <Text className="text-xs font-semibold text-successDeep">Active</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
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

        {/* Summary Card */}
        <View className="mb-4 items-center rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-3 h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primarySoft">
            {logo ? (
              <Image source={{ uri: logo }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <Ionicons name="storefront-outline" size={36} color={colors.primary} />
            )}
          </View>
          <Text className="text-lg font-bold text-text">{merchant.name}</Text>
          {category && <Text className="mt-1 text-sm text-textMuted">{category}</Text>}
        </View>

        {/* Description */}
        {detail?.description && (
          <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
            <Text className="mb-2 text-base font-bold text-textStrong">About</Text>
            <Text className="text-sm leading-5 text-textSecondary">{detail.description}</Text>
          </View>
        )}

        {/* Loading indicator while enriching with detail-only fields */}
        {isLoading && !detail && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Merchant Details */}
        <View className="rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-3 text-base font-bold text-textStrong">Merchant Details</Text>
          <DetailRow label="Wallet" value={merchant.wallet} />
          {category && <DetailRow label="Category" value={category} />}
          {detail?.website && <DetailRow label="Website" value={detail.website} />}
          <DetailRow label="Status" value={merchant.isActive ? 'Active' : 'Inactive'} />
          {detail?.createdAt && (
            <DetailRow label="Member since" value={formatDate(detail.createdAt)} />
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA at bottom */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-6 pb-2 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <TouchableOpacity
          activeOpacity={0.8}
          className="items-center rounded-xl bg-cta py-4"
          onPress={() => onStartPurchasePress(merchant)}
          accessibilityLabel="Start BNPL purchase"
          accessibilityRole="button">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-white">Start BNPL Purchase</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MerchantDetailScreen;
