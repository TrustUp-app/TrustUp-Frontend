import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMerchants } from '../../hooks/merchants/use-merchants';
import type { MerchantSummary } from '../../types/api';

const colors = require('../../theme/colors.json');

// ─── Sub-components ─────────────────────────────────────────────────────────

const MerchantCard = ({
  merchant,
  onPress,
}: {
  merchant: MerchantSummary;
  onPress: (merchant: MerchantSummary) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress(merchant)}
    className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
    accessibilityRole="button"
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
    <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
  </TouchableOpacity>
);

const MerchantCardSkeleton = () => (
  <View className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
    <View className="h-12 w-12 rounded-xl bg-gray-100" />
    <View className="flex-1 gap-2">
      <View className="h-3.5 w-2/3 rounded-full bg-gray-100" />
      <View className="h-3 w-1/3 rounded-full bg-gray-100" />
    </View>
  </View>
);

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) => (
  <View className="flex-1 items-center justify-center px-8 pt-24">
    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name={icon} size={32} color={colors.textSubtle} />
    </View>
    <Text className="mb-1 text-base font-semibold text-text">{title}</Text>
    <Text className="text-center text-sm leading-5 text-textSecondary">{description}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface MerchantsScreenProps {
  onBack: () => void;
  onMerchantPress: (merchant: MerchantSummary) => void;
}

const MerchantsScreen: React.FC<MerchantsScreenProps> = ({ onBack, onMerchantPress }) => {
  const insets = useSafeAreaInsets();
  const { merchants, isLoading, error, hasMore, query, setQuery, loadMore, refresh } =
    useMerchants();

  const isInitialLoad = isLoading && merchants.length === 0;
  const showEmpty = !isLoading && !error && merchants.length === 0;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Load more when user scrolls within 100px of the bottom
    if (distanceFromBottom < 100 && hasMore && !isLoading) {
      loadMore();
    }
  };

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
        <View className="mb-4 flex-row items-center gap-3">
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

        {/* Search bar */}
        <View className="flex-row items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
          <Ionicons name="search" size={18} color={colors.textSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search merchants"
            placeholderTextColor={colors.placeholder}
            className="flex-1 text-sm text-text"
            accessibilityLabel="Search merchants by name"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              accessibilityLabel="Clear search"
              accessibilityRole="button">
              <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}>
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

        {/* Loading skeleton (initial load) */}
        {isInitialLoad && Array.from({ length: 6 }).map((_, i) => <MerchantCardSkeleton key={i} />)}

        {/* Merchant list */}
        {!isInitialLoad &&
          merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} onPress={onMerchantPress} />
          ))}

        {/* Load-more spinner */}
        {isLoading && !isInitialLoad && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Empty states */}
        {showEmpty && query.trim() ? (
          <EmptyState
            icon="search-outline"
            title="No merchants found"
            description={`No merchants match "${query.trim()}". Try a different search.`}
          />
        ) : (
          showEmpty && (
            <EmptyState
              icon="storefront-outline"
              title="Merchants coming soon"
              description={
                "We're onboarding merchants that accept Buy Now, Pay Later.\nCheck back shortly."
              }
            />
          )
        )}
      </ScrollView>
    </View>
  );
};

export default MerchantsScreen;
