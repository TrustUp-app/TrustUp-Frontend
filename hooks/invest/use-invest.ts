import { useState, useRef, useCallback } from 'react';
import { ScrollView } from 'react-native';

/**
 * Return type for the useInvest hook
 */
export interface UseInvestReturn {
  depositAmount: string;
  scrollViewRef: React.RefObject<ScrollView | null>;
  formatCurrency: (value: string) => string;
  handleAmountChange: (text: string) => void;
  isDepositValid: () => boolean;
  handleDeposit: () => void;
}

/**
 * Formats the currency value, returning exactly 2 decimal places.
 */
export const formatCurrency = (value: string): string => {
  if (!value || value.trim() === '') {
    return '0.00';
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
    return '0.00';
  }

  // Parse to number and format to 2 decimal places
  const numValue = parseFloat(filtered);

  // Handle NaN case
  if (isNaN(numValue)) {
    return '0.00';
  }

  // Format to exactly 2 decimal places
  const formatted = numValue.toFixed(2);

  return formatted;
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

  // Validate deposit amount using derived pure function
  const isDepositValid = useCallback((): boolean => {
    return validateDepositAmount(depositAmount);
  }, [depositAmount]);

  // Handle deposit button press
  const handleDeposit = useCallback((): void => {
    console.log(`Deposit initiated: $${formatCurrency(depositAmount)}`);
  }, [depositAmount]);

  return {
    depositAmount,
    scrollViewRef,
    formatCurrency,
    handleAmountChange,
    isDepositValid,
    handleDeposit,
  };
};
