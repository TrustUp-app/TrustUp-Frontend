import { useState, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';

import { investService } from '../../services/invest.service';

/**
 * Return type for the useInvest hook
 */
export interface UseInvestReturn {
  depositAmount: string;
  scrollViewRef: React.RefObject<ScrollView | null>;
  formatCurrency: (value: string) => string;
  handleAmountChange: (text: string) => void;
  isDepositValid: () => boolean;
  handleDeposit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  clearFeedback: () => void;
}

/**
 * Formats the currency value with thousand separators,
 * preserving up to 2 decimal places.
 */
export const formatCurrency = (value: string): string => {
  if (!value || value.trim() === '') {
    return '';
  }

  // Filter out non-numeric characters except decimal point
  let filtered = value.replace(/[^\d.]/g, '');

  // Handle multiple decimal points - keep only the first one
  const decimalCount = (filtered.match(/\./g) || []).length;
  if (decimalCount > 1) {
    const parts = filtered.split('.');
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }

  // Remove leading zeros (except for values < 1)
  if (filtered.startsWith('0') && filtered.length > 1 && filtered[1] !== '.') {
    filtered = filtered.replace(/^0+/, '');
  }

  // Handle case where only decimal point remains after filtering
  if (filtered === '.' || filtered === '') {
    return '';
  }

  // Separate integer and decimal portions
  const [integerPart, decimalPart] = filtered.split('.');

  // Add thousand separators to the integer portion
  const formattedInteger = (integerPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Preserve the decimal point while typing and limit to 2 decimal places
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.substring(0, 2)}`;
  }

  return formattedInteger;
};

/**
 * Validates if the given deposit amount is at least $10.00.
 */
export const validateDepositAmount = (depositAmount: string): boolean => {
  // Handle empty input
  if (!depositAmount || depositAmount === '') {
    return false;
  }

  // Parse depositAmount to number
  const amount = parseFloat(depositAmount);

  // Handle NaN or zero cases
  if (isNaN(amount) || amount === 0) {
    return false;
  }

  // Check if amount is >= 10.00
  return amount >= 10.0;
};

/**
 * Custom hook for Invest logic
 * Handles formatting, form state, and handlers for the Invest Screen.
 */
export const useInvest = (): UseInvestReturn => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle amount input changes
  const handleAmountChange = useCallback((text: string): void => {
    // Remove $ sign and spaces if present
    let filtered = text.replace(/[$\s,]/g, '');

    // Filter out non-numeric characters except decimal point
    filtered = filtered.replace(/[^\d.]/g, '');

    // Handle multiple decimal points - keep only the first one
    const decimalCount = (filtered.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = filtered.split('.');
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }

    // Remove leading zeros (except for values < 1)
    if (filtered.startsWith('0') && filtered.length > 1 && filtered[1] !== '.') {
      filtered = filtered.replace(/^0+/, '');
    }

    // Handle empty input
    if (filtered === '' || filtered === '.') {
      setDepositAmount('');
      return;
    }

    // Limit to 2 decimal places
    const parts = filtered.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      filtered = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Update state with the raw numeric value (without $ sign)
    setDepositAmount(filtered);
  }, []);

  // Clear any previous success/error feedback (e.g. when the amount changes)
  const clearFeedback = useCallback((): void => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Validate deposit amount using derived pure function
  const isDepositValid = useCallback((): boolean => {
    return validateDepositAmount(depositAmount);
  }, [depositAmount]);

  // Handle deposit button press: POST the amount to the real API endpoint
  const handleDeposit = useCallback(async (): Promise<void> => {
    setError(null);
    setSuccessMessage(null);

    if (!validateDepositAmount(depositAmount)) {
      setError('Minimum deposit is $10.00');
      return;
    }

    setIsLoading(true);
    try {
      // The API builds the (unsigned) deposit transaction; on-chain signing is a
      // documented follow-up, so success here means the request was accepted.
      const response = await investService.deposit({
        amount: parseFloat(depositAmount),
      });
      setSuccessMessage(response.description || 'Deposit transaction prepared.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to start the deposit. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [depositAmount]);

  return {
    depositAmount,
    scrollViewRef,
    formatCurrency,
    handleAmountChange,
    isDepositValid,
    handleDeposit,
    isLoading,
    error,
    successMessage,
    clearFeedback,
  };
};
