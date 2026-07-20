import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  usePayScreen,
  getCreditUsageRatio,
  getInstallmentProgress,
  MIN_ELIGIBLE_SCORE,
} from '../../hooks/pay/use-pay-screen';
import { formatLoanAmount, getDueDateLabel } from '../../hooks/loans/use-loans';
import { repayLoan } from '../../services/loans.service';
import { ApiClientError } from '../../lib/api-client';
import { PayConfirmationSheet } from './pay/PayConfirmationSheet';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

interface PayScreenProps {
  onLoanHistoryPress?: () => void;
  onViewReputationPress?: () => void;
  onExploreMerchantsPress?: () => void;
  /** Shows a toast at the app root (hosted by MainLayout, outside the scroll view). */
  onToast?: (message: string) => void;
}

type PayState = 'idle' | 'processing' | 'failed';

const PayScreen = ({
  onLoanHistoryPress,
  onViewReputationPress,
  onExploreMerchantsPress,
  onToast,
}: PayScreenProps) => {
  const {
    reputationScore,
    maxCredit,
    availableCredit,
    activeLoan,
    nextPayment,
    isEligible,
    isLoading,
    error,
    refresh,
  } = usePayScreen();

  const [isPaySheetOpen, setIsPaySheetOpen] = useState(false);
  const [payState, setPayState] = useState<PayState>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reputationPercent = Math.round(Math.min(Math.max(reputationScore / 100, 0), 1) * 100);
  const creditPercent = Math.round(getCreditUsageRatio(availableCredit, maxCredit) * 100);
  const installmentPercent = Math.round(getInstallmentProgress(activeLoan) * 100);

  const openPaySheet = () => {
    setPayState('idle');
    setPayError(null);
    setIsPaySheetOpen(true);
  };

  const closePaySheet = () => {
    if (payState === 'processing') return; // block dismissal mid-payment
    setIsPaySheetOpen(false);
    setPayState('idle');
    setPayError(null);
  };

  const confirmPay = useCallback(async () => {
    if (!activeLoan || nextPayment?.amount == null) return;
    setPayState('processing');
    setPayError(null);
    try {
      // POST /loans/:id/pay — returns an unsigned XDR + preview. Signing the XDR
      // and submitting it to the network is a follow-up that needs the wallet
      // integration (not yet available); the repayment request itself succeeds here.
      await repayLoan(activeLoan.id, nextPayment.amount);
      if (!isMountedRef.current) return;
      setIsPaySheetOpen(false);
      setPayState('idle');
      onToast?.('Payment submitted');
      refresh(); // refresh loan + credit data
    } catch (err) {
      if (!isMountedRef.current) return;
      setPayState('failed');
      setPayError(
        err instanceof ApiClientError ? err.message : 'Payment failed. Please try again.'
      );
    }
  }, [activeLoan, nextPayment, onToast, refresh]);

  // Full-screen loader on first load (before any data has arrived).
  if (isLoading && reputationScore === 0 && !error) {
    return (
      <View className="items-center justify-center px-6 pt-24">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="px-6 pt-6">
      {/* Error banner */}
      {error && (
        <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-errorSoft px-4 py-3">
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text className="flex-1 text-sm text-error">{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text className="text-sm font-semibold text-error">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reputation Score Card */}
      <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-successBadge">
              <Ionicons name="trophy" size={14} color={colors.successDeep} />
            </View>
            <Text className="font-medium text-textMuted">Reputation Score</Text>
          </View>
          {isEligible && (
            <View className="rounded-full bg-successSoft px-3 py-1">
              <Text className="text-xs font-semibold text-successDeep">Verified</Text>
            </View>
          )}
        </View>

        <View className="mb-4 items-center">
          <View className="flex-row items-end">
            <Text className="text-6xl font-bold text-primary">{reputationScore}</Text>
            <Text className="mb-2 text-2xl text-textMuted">/100</Text>
          </View>
        </View>

        <View className="mb-2 h-2 w-full rounded-full bg-gray-200">
          <View
            className="h-2 rounded-full bg-primary"
            style={{ width: `${reputationPercent}%` }}
          />
        </View>

        <Text className="text-center text-xs text-textMuted">
          {isEligible ? 'Higher score = more credit' : 'Build your reputation to unlock credit'}
        </Text>
      </View>

      {isEligible ? (
        <>
          {/* Available Credit Card */}
          <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="mb-2 text-sm text-textMuted">Available Credit</Text>
                <Text className="text-4xl font-bold text-primary">
                  {formatLoanAmount(availableCredit)}
                </Text>
                <Text className="mt-1 text-xs text-textMuted">
                  of {formatLoanAmount(maxCredit)} • based on your reputation
                </Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-amberSoft">
                <Ionicons name="wallet" size={24} color={colors.amber} />
              </View>
            </View>
            <View className="h-2 w-full rounded-full bg-gray-200">
              <View
                className="h-2 rounded-full bg-primary"
                style={{ width: `${creditPercent}%` }}
              />
            </View>
          </View>

          {/* Amount Due Card (active loan) or No-active-loan state */}
          {activeLoan && nextPayment?.amount != null ? (
            <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
              <View className="mb-3 flex-row items-center gap-2">
                <View className="rounded-full bg-successSoft px-3 py-1">
                  <Text className="text-xs font-semibold text-successDeep">ACTIVE</Text>
                </View>
                {nextPayment.dueDate && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                    <Text className="text-xs text-textMuted">
                      {getDueDateLabel(nextPayment.dueDate)}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="mb-2 text-sm text-textMuted">Amount Due</Text>
              <Text className="mb-1 text-4xl font-bold text-text">
                {formatLoanAmount(nextPayment.amount)}
              </Text>
              <Text className="mb-4 text-xs text-textMuted">
                of {formatLoanAmount(activeLoan.totalRepayment)}
              </Text>

              <View className="mb-4 h-2 w-full rounded-full bg-gray-200">
                <View
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${installmentPercent}%` }}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openPaySheet}
                className="items-center rounded-xl bg-cta py-4"
                accessibilityRole="button"
                accessibilityLabel="Pay now">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-semibold text-white">Pay now</Text>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-4 items-center rounded-2xl bg-white p-6 shadow-sm">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primarySoft">
                <Ionicons name="checkmark-done-outline" size={28} color={colors.primary} />
              </View>
              <Text className="mb-1 text-base font-semibold text-text">No active loan</Text>
              <Text className="mb-4 text-center text-sm text-textSecondary">
                You&apos;re all caught up. Shop with BNPL at a merchant to start a new plan.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onExploreMerchantsPress}
                className="w-full items-center rounded-xl bg-cta py-4"
                accessibilityRole="button"
                accessibilityLabel="Explore merchants">
                <Text className="text-base font-semibold text-white">Explore merchants</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        /* Not eligible yet */
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-3 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-amberSoft">
              <Ionicons name="lock-closed-outline" size={22} color={colors.amber} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-text">Not eligible yet</Text>
              <Text className="text-xs text-textMuted">
                Reach a score of {MIN_ELIGIBLE_SCORE} to unlock BNPL credit
              </Text>
            </View>
          </View>
          <View className="mb-2 h-2 w-full rounded-full bg-gray-200">
            <View
              className="h-2 rounded-full bg-amber"
              style={{ width: `${reputationPercent}%` }}
            />
          </View>
          <Text className="text-xs text-textMuted">
            {reputationScore}/{MIN_ELIGIBLE_SCORE} —{' '}
            {Math.max(MIN_ELIGIBLE_SCORE - reputationScore, 0)} points to go. Make on-time payments
            to build your reputation.
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View className="mb-4 flex-row gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onViewReputationPress}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="View reputation">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-successSoft">
            <Ionicons name="eye-outline" size={24} color={colors.successDeep} />
          </View>
          <Text className="text-center text-sm font-medium text-text">View</Text>
          <Text className="text-center text-sm font-medium text-text">Reputation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onExploreMerchantsPress}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Explore merchants">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-amberSoft">
            <Ionicons name="compass-outline" size={24} color={colors.amber} />
          </View>
          <Text className="text-center text-sm font-medium text-text">Explore</Text>
          <Text className="text-center text-sm font-medium text-text">Merchants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onLoanHistoryPress}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Loan history">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-errorSoft">
            <Ionicons name="time-outline" size={24} color={colors.error} />
          </View>
          <Text className="text-center text-sm font-medium text-text">Loan History</Text>
        </TouchableOpacity>
      </View>

      {/* BNPL eligibility card */}
      {isEligible && (
        <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-successSoft">
              <Ionicons name="checkmark-circle" size={24} color={colors.successDeep} />
            </View>
            <View className="flex-1">
              <Text className="mb-1 font-semibold text-text">You are eligible for BNPL</Text>
              <Text className="text-xs text-textMuted">
                Start shopping with Buy Now, Pay Later at hundreds of merchants
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Pay-now confirmation sheet */}
      {activeLoan && nextPayment?.amount != null && (
        <PayConfirmationSheet
          visible={isPaySheetOpen}
          amount={nextPayment.amount}
          dueDate={nextPayment.dueDate}
          isProcessing={payState === 'processing'}
          isFailed={payState === 'failed'}
          stepLabel="Processing…"
          error={payError}
          onConfirm={confirmPay}
          onClose={closePaySheet}
        />
      )}
    </View>
  );
};

export default PayScreen;
