import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatLoanAmount } from '../../../hooks/loans/use-loans';

const colors = require('../../../theme/colors.json');

/**
 * Wallet address the payment is drawn from.
 *
 * @todo Source the connected wallet address from the wallet context once it
 *   exists. Hardcoded here so the confirmation UI can be reviewed.
 */
const MOCK_WALLET_ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

/**
 * Truncates a wallet address for display, e.g. "GBRPYH…7OX2H".
 */
export const truncateAddress = (address: string, lead = 6, tail = 4): string => {
  if (!address || address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
};

/**
 * Formats an ISO date string as e.g. "Jul 20, 2026". Returns "—" when absent.
 * Formats in UTC so the backend's midnight-UTC timestamps (and plain date-only
 * strings) don't shift a day in negative timezones.
 */
const formatDueDate = (iso: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  emphasize?: boolean;
}

const DetailRow = ({ icon, label, value, emphasize }: DetailRowProps) => (
  <View className="flex-row items-center justify-between border-b border-borderSubtle py-3">
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text className="text-sm text-textMuted">{label}</Text>
    </View>
    <Text
      className={`font-semibold ${emphasize ? 'text-lg text-text' : 'text-sm text-textStrong'}`}
      numberOfLines={1}>
      {value}
    </Text>
  </View>
);

interface PayConfirmationSheetProps {
  visible: boolean;
  /** Next installment amount in USD. */
  amount: number;
  /** Next installment due date (ISO), or null if unknown. */
  dueDate: string | null;
  /** True while the payment is in flight (blocks dismissal + double submit). */
  isProcessing: boolean;
  /** True when the last attempt failed (shows inline error + "Try again"). */
  isFailed: boolean;
  /** Label for the current in-flight step, shown next to the spinner. */
  stepLabel: string;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Bottom-sheet modal that confirms a single installment payment. Purely
 * presentational — the parent owns the repayment state (via useLoanRepayment)
 * and reacts to success/error. Shows the amount, due date and payment source,
 * the in-flight state, and an inline error.
 *
 * Implemented with React Native's built-in `Modal` (styled as a bottom sheet)
 * rather than pulling in `@gorhom/bottom-sheet`, to avoid adding a dependency.
 */
export const PayConfirmationSheet = ({
  visible,
  amount,
  dueDate,
  isProcessing,
  isFailed,
  stepLabel,
  error,
  onConfirm,
  onClose,
}: PayConfirmationSheetProps) => {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    if (isProcessing) return; // block dismissal mid-payment
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={handleClose}
        accessibilityLabel="Close">
        {/* Inner Pressable captures taps so they don't close the sheet. */}
        <Pressable
          onPress={() => {}}
          className="rounded-t-3xl bg-white px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          {/* Grab handle */}
          <View className="mb-4 items-center">
            <View className="h-1.5 w-12 rounded-full bg-gray-300" />
          </View>

          <Text className="mb-1 text-xl font-bold text-textStrong">Confirm payment</Text>
          <Text className="mb-4 text-sm text-textMuted">
            Review the details before paying your next installment.
          </Text>

          <View className="mb-4 rounded-2xl bg-backgroundSoft px-4">
            <DetailRow
              icon="cash-outline"
              label="Amount"
              value={formatLoanAmount(amount)}
              emphasize
            />
            <DetailRow icon="calendar-outline" label="Due date" value={formatDueDate(dueDate)} />
            <DetailRow
              icon="wallet-outline"
              label="Pay from"
              value={truncateAddress(MOCK_WALLET_ADDRESS)}
            />
          </View>

          {/* Inline error */}
          {isFailed && (
            <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-errorSoft px-4 py-3">
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text className="flex-1 text-sm text-error">
                {error || 'Payment failed. Please try again.'}
              </Text>
            </View>
          )}

          {/* Confirm button — disabled + spinner while processing to block double-submit */}
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.8}
            disabled={isProcessing}
            className="mb-3 flex-row items-center justify-center gap-2 rounded-xl bg-cta py-4"
            style={{ opacity: isProcessing ? 0.7 : 1 }}
            accessibilityRole="button"
            accessibilityState={{ disabled: isProcessing, busy: isProcessing }}
            accessibilityLabel="Confirm and pay">
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-base font-semibold text-white">
                  {stepLabel || 'Processing…'}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-white">
                  {isFailed ? 'Try again' : `Pay ${formatLoanAmount(amount)}`}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            disabled={isProcessing}
            className="items-center py-2"
            accessibilityRole="button"
            accessibilityLabel="Cancel">
            <Text className="text-sm font-medium text-textMuted">Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
