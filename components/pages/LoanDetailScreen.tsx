import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  formatLoanAmount,
  getRepaymentProgress,
  hasOverdueInstallments,
} from '../../hooks/loans/use-loans';
import { useLoanRepayment } from '../../hooks/loans/use-loan-repayment';
import type { Loan, LoanInstallment, LoanStatus } from '../../types/Loan';

const colors = require('../../theme/colors.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<LoanStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: colors.amberSoft, fg: colors.amber, label: 'Pending' },
  active: { bg: colors.successSoft, fg: colors.successDeep, label: 'Active' },
  completed: { bg: colors.primarySoft, fg: colors.primary, label: 'Completed' },
  defaulted: { bg: colors.errorSoft, fg: colors.error, label: 'Defaulted' },
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ─── Installment Timeline Item ────────────────────────────────────────────────

interface TimelineItemProps {
  installment: LoanInstallment;
  isLast: boolean;
}

const TimelineItem = ({ installment, isLast }: TimelineItemProps) => {
  const isPaid = installment.status === 'paid';
  const isOverdue = installment.status === 'overdue';
  const isPending = installment.status === 'pending';

  // Pick node color/icon based on status
  let nodeColor = colors.textSubtle;
  let nodeBg = '#F3F4F6';
  let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

  if (isPaid) {
    nodeColor = colors.successDeep;
    nodeBg = colors.successSoft;
    iconName = 'checkmark-circle';
  } else if (isOverdue) {
    nodeColor = colors.error;
    nodeBg = colors.errorSoft;
    iconName = 'alert-circle';
  }

  return (
    <View className="flex-row">
      {/* Timeline column */}
      <View className="mr-4 w-8 items-center">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: nodeBg }}>
          <Ionicons name={iconName} size={18} color={nodeColor} />
        </View>
        {!isLast && (
          <View
            className="w-[2px] flex-1"
            style={{
              backgroundColor: isPaid ? colors.successSoft : colors.border,
              minHeight: 40,
            }}
          />
        )}
      </View>

      {/* Content column */}
      <View className="flex-1 pb-5">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm font-semibold ${
              isPaid ? 'text-textStrong' : isOverdue ? 'text-error' : 'text-textSecondary'
            }`}>
            Installment {installment.installmentNumber}
          </Text>
          <Text className="text-base font-bold text-textStrong">
            {formatLoanAmount(installment.amount)}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          <Text className="text-xs text-textMuted">Due: {formatDate(installment.dueDate)}</Text>
          {isPaid && installment.paidDate && (
            <Text className="text-xs text-successDeep">
              Paid {formatDate(installment.paidDate)}
            </Text>
          )}
          {isOverdue && <Text className="text-xs font-semibold text-error">Overdue</Text>}
          {isPending && <Text className="text-xs text-textMuted">Upcoming</Text>}
        </View>
      </View>
    </View>
  );
};

// ─── Payment Processing Overlay ───────────────────────────────────────────────

interface PaymentOverlayProps {
  step: string;
  stepLabel: string;
  error: string | null;
  onDismiss: () => void;
}

const PaymentOverlay = ({ step, stepLabel, error, onDismiss }: PaymentOverlayProps) => {
  const isSuccess = step === 'success';
  const isFailed = step === 'failed';
  const showDismiss = isSuccess || isFailed;

  return (
    <View className="absolute inset-0 z-50 items-center justify-center" style={styles.overlayBg}>
      <View
        className="mx-8 w-full max-w-sm items-center rounded-3xl bg-white p-8"
        style={styles.card}>
        {/* Status icon */}
        {isSuccess ? (
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-successSoft">
            <Ionicons name="checkmark-circle" size={36} color={colors.successDeep} />
          </View>
        ) : isFailed ? (
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-errorSoft">
            <Ionicons name="close-circle" size={36} color={colors.error} />
          </View>
        ) : (
          <View className="mb-4">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        <Text className="mb-2 text-center text-lg font-bold text-textStrong">
          {isSuccess ? 'Payment Successful!' : isFailed ? 'Payment Failed' : 'Processing Payment'}
        </Text>

        <Text className="mb-6 text-center text-sm text-textSecondary">{error || stepLabel}</Text>

        {/* Step indicators */}
        {!showDismiss && (
          <View className="mb-4 flex-row items-center gap-2">
            {(['requesting', 'signing', 'submitting'] as const).map((s) => {
              const steps = ['requesting', 'signing', 'submitting'];
              const currentIdx = steps.indexOf(step);
              const thisIdx = steps.indexOf(s);
              const isDone = thisIdx < currentIdx;
              const isCurrent = s === step;

              return (
                <View key={s} className="flex-1 items-center">
                  <View
                    className="h-1.5 w-full rounded-full"
                    style={{
                      backgroundColor: isDone
                        ? colors.successDeep
                        : isCurrent
                          ? colors.primary
                          : colors.border,
                    }}
                  />
                  <Text className="mt-1 text-[10px] text-textMuted">
                    {s === 'requesting' ? 'Prepare' : s === 'signing' ? 'Sign' : 'Submit'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {showDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={0.8}
            className="items-center rounded-xl px-8 py-3"
            style={{ backgroundColor: isSuccess ? colors.primary : colors.error }}>
            <Text className="text-sm font-semibold text-white">
              {isSuccess ? 'Done' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface LoanDetailScreenProps {
  loan: Loan;
  onBack: () => void;
}

const LoanDetailScreen: React.FC<LoanDetailScreenProps> = ({ loan, onBack }) => {
  const insets = useSafeAreaInsets();
  const badge = STATUS_BADGE[loan.status];
  const progress = getRepaymentProgress(loan);
  const progressPercent = Math.round(progress * 100);
  const showOverdueWarning = hasOverdueInstallments(loan);
  const canPay = loan.status === 'active' && loan.nextPaymentAmount != null;

  const {
    isProcessing,
    paymentStep,
    stepLabel,
    error: paymentError,
    initiatePayment,
    reset: resetPayment,
  } = useLoanRepayment();

  const showPaymentOverlay = paymentStep !== 'idle';

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
            {loan.merchantName}
          </Text>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: badge.bg }}>
            <Text style={{ color: badge.fg }} className="text-xs font-semibold">
              {badge.label}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Loan Summary Card */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className="text-xs text-textMuted">Loan Amount</Text>
              <Text className="text-4xl font-bold text-textStrong">
                {formatLoanAmount(loan.amount)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-textMuted">With Interest</Text>
              <Text className="text-lg font-semibold text-textSecondary">
                {formatLoanAmount(loan.totalWithInterest)}
              </Text>
            </View>
          </View>

          {/* Stats grid */}
          <View className="mb-4 flex-row">
            <View className="flex-1 rounded-xl bg-primarySoft p-3">
              <Text className="text-[10px] text-textMuted">Interest Rate</Text>
              <Text className="text-lg font-bold text-primary">{loan.interestRate}%</Text>
            </View>
            <View className="mx-2 flex-1 rounded-xl bg-successSoft p-3">
              <Text className="text-[10px] text-textMuted">Installments</Text>
              <Text className="text-lg font-bold text-successDeep">{loan.installmentCount}</Text>
            </View>
            <View className="flex-1 rounded-xl bg-amberSoft p-3">
              <Text className="text-[10px] text-textMuted">Repaid</Text>
              <Text className="text-lg font-bold" style={{ color: colors.amber }}>
                {progressPercent}%
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="mb-2 h-2.5 w-full rounded-full bg-gray-200">
            <View
              className="h-2.5 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: loan.status === 'defaulted' ? colors.error : colors.primary,
              }}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-textMuted">
              Paid: {formatLoanAmount(loan.amountPaid)}
            </Text>
            <Text className="text-xs text-textMuted">
              Remaining: {formatLoanAmount(loan.totalWithInterest - loan.amountPaid)}
            </Text>
          </View>
        </View>

        {/* Overdue Warning */}
        {showOverdueWarning && (
          <View className="mb-4 flex-row items-start gap-3 rounded-2xl bg-errorSoft p-4">
            <Ionicons name="warning" size={20} color={colors.error} />
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-error">Overdue Payment Warning</Text>
              <Text className="text-xs leading-4 text-textSecondary">
                You have overdue installments. Late payments negatively impact your reputation score
                and may reduce your available credit limit.
              </Text>
            </View>
          </View>
        )}

        {/* Payment Timeline */}
        <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-base font-bold text-textStrong">Payment Timeline</Text>
          {loan.installments.map((installment, index) => (
            <TimelineItem
              key={installment.id}
              installment={installment}
              isLast={index === loan.installments.length - 1}
            />
          ))}
        </View>

        {/* Loan Details Card */}
        <View className="rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-3 text-base font-bold text-textStrong">Loan Details</Text>
          <DetailRow label="Loan ID" value={loan.id} />
          <DetailRow label="Merchant" value={loan.merchantName} />
          <DetailRow label="Created" value={formatDate(loan.createdAt)} />
          {loan.completedAt && <DetailRow label="Completed" value={formatDate(loan.completedAt)} />}
          {loan.nextPaymentDue && (
            <DetailRow label="Next Payment" value={formatDate(loan.nextPaymentDue)} />
          )}
          {loan.nextPaymentAmount != null && (
            <DetailRow label="Next Amount" value={formatLoanAmount(loan.nextPaymentAmount)} />
          )}
        </View>
      </ScrollView>

      {/* Fixed CTA at bottom */}
      {canPay && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-6 pb-2 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <TouchableOpacity
            activeOpacity={0.8}
            className="items-center rounded-xl bg-cta py-4"
            onPress={() => initiatePayment(loan.id)}
            disabled={isProcessing}
            accessibilityLabel="Make a payment"
            accessibilityRole="button">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-white">
                Pay {formatLoanAmount(loan.nextPaymentAmount!)}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Processing Overlay */}
      {showPaymentOverlay && (
        <PaymentOverlay
          step={paymentStep}
          stepLabel={stepLabel}
          error={paymentError}
          onDismiss={resetPayment}
        />
      )}
    </View>
  );
};

// ─── Small Components ─────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between border-b border-borderSubtle py-3">
    <Text className="text-sm text-textMuted">{label}</Text>
    <Text className="text-sm font-medium text-textStrong" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlayBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
});

export default LoanDetailScreen;
