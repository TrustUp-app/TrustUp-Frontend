import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLoans, formatLoanAmount, getRepaymentProgress, getDueDateLabel } from '../../hooks/loans/use-loans';
import type { Loan, LoanStatus } from '../../types/Loan';

const colors = require('../../theme/colors.json');

// ─── Status Badge Styling ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<LoanStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: colors.amberSoft, text: colors.amber, label: 'Pending' },
  active: { bg: colors.successSoft, text: colors.successDeep, label: 'Active' },
  completed: { bg: colors.primarySoft, text: colors.primary, label: 'Completed' },
  defaulted: { bg: colors.errorSoft, text: colors.error, label: 'Defaulted' },
};

// Only show these three tabs (pending loans are rare, shown inline)
const TAB_FILTERS: { status: LoanStatus; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'defaulted', label: 'Defaulted' },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

interface LoanCardProps {
  loan: Loan;
  onPress: (loan: Loan) => void;
}

const LoanCard = ({ loan, onPress }: LoanCardProps) => {
  const progress = getRepaymentProgress(loan);
  const statusStyle = STATUS_STYLES[loan.status];
  const progressPercent = Math.round(progress * 100);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(loan)}
      className="mb-3 rounded-2xl bg-white p-5 shadow-sm"
      accessibilityLabel={`Loan from ${loan.merchantName}, ${formatLoanAmount(loan.amount)}`}
      accessibilityRole="button"
    >
      {/* Top row: merchant + status */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primarySoft">
            <Ionicons name="storefront-outline" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text" numberOfLines={1}>
              {loan.merchantName}
            </Text>
            <Text className="text-xs text-textMuted">
              {loan.installmentCount} installments
            </Text>
          </View>
        </View>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: statusStyle.bg }}
        >
          <Text style={{ color: statusStyle.text }} className="text-xs font-semibold">
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Amount row */}
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="text-xs text-textMuted">Total amount</Text>
          <Text className="text-2xl font-bold text-textStrong">
            {formatLoanAmount(loan.totalWithInterest)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-textMuted">Paid</Text>
          <Text className="text-base font-semibold text-success">
            {formatLoanAmount(loan.amountPaid)}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="mb-2 h-2 w-full rounded-full bg-gray-200">
        <View
          className="h-2 rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: loan.status === 'defaulted' ? colors.error : colors.primary,
          }}
        />
      </View>

      {/* Bottom row: due date or completion info */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-textMuted">{progressPercent}% repaid</Text>
        {loan.nextPaymentDue ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text className="text-xs text-textMuted">
              {getDueDateLabel(loan.nextPaymentDue)}
            </Text>
          </View>
        ) : loan.status === 'completed' ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={12} color={colors.successDeep} />
            <Text className="text-xs text-successDeep">Fully repaid</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({ status }: { status: LoanStatus }) => {
  const messages: Record<LoanStatus, { icon: keyof typeof Ionicons.glyphMap; text: string }> = {
    active: { icon: 'wallet-outline', text: 'No active loans right now.\nApply for BNPL at a merchant to get started.' },
    completed: { icon: 'checkmark-done-outline', text: 'No completed loans yet.\nFinish repaying a loan to see it here.' },
    defaulted: { icon: 'shield-checkmark-outline', text: 'No defaulted loans — great job!\nKeep making payments on time.' },
    pending: { icon: 'hourglass-outline', text: 'No pending loan applications.' },
  };

  const config = messages[status];

  return (
    <View className="flex-1 items-center justify-center px-8 pt-24">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Ionicons name={config.icon} size={32} color={colors.textSubtle} />
      </View>
      <Text className="text-center text-sm leading-5 text-textSecondary">
        {config.text}
      </Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface LoanHistoryScreenProps {
  onBack: () => void;
  onLoanPress: (loan: Loan) => void;
}

const LoanHistoryScreen: React.FC<LoanHistoryScreenProps> = ({ onBack, onLoanPress }) => {
  const insets = useSafeAreaInsets();
  const {
    loans,
    isLoading,
    error,
    hasMore,
    activeFilter,
    setActiveFilter,
    loadMore,
    refresh,
  } = useLoans();

  // Fetch initial data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleScroll = (event: any) => {
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
          paddingBottom: 0,
        }}
      >
        <View className="mb-4 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-white"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text">Loan History</Text>
        </View>

        {/* Tab bar */}
        <View className="flex-row">
          {TAB_FILTERS.map((tab) => {
            const isActive = activeFilter === tab.status;
            return (
              <TouchableOpacity
                key={tab.status}
                onPress={() => setActiveFilter(tab.status)}
                activeOpacity={0.7}
                className="flex-1 items-center pb-3"
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-primary' : 'text-textMuted'
                  }`}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 h-[3px] w-12 rounded-full bg-primary" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
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

        {/* Loan cards */}
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} onPress={onLoanPress} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        {/* Empty state */}
        {!isLoading && loans.length === 0 && !error && (
          <EmptyState status={activeFilter} />
        )}
      </ScrollView>
    </View>
  );
};

export default LoanHistoryScreen;
