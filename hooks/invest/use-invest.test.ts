import { formatCurrency, validateDepositAmount } from './use-invest';

declare var describe: any;
declare var it: any;
declare var expect: any;

describe('useInvest utility functions', () => {
  describe('formatCurrency', () => {
    it('returns "0.00" for empty or invalid input', () => {
      expect(formatCurrency('')).toBe('0.00');
      expect(formatCurrency('abc')).toBe('0.00');
    });

    it('formats valid numbers to 2 decimal places', () => {
      expect(formatCurrency('10')).toBe('10.00');
      expect(formatCurrency('10.5')).toBe('10.50');
      expect(formatCurrency('10.55')).toBe('10.55');
    });

    it('filters out non-numeric characters', () => {
      expect(formatCurrency('$10.50')).toBe('10.50');
      expect(formatCurrency('10,000.50')).toBe('10000.50');
    });
  });

  describe('validateDepositAmount', () => {
    it('returns false for empty or invalid input', () => {
      expect(validateDepositAmount('')).toBe(false);
      expect(validateDepositAmount('abc')).toBe(false);
    });

    it('returns false for amounts less than 10', () => {
      expect(validateDepositAmount('0')).toBe(false);
      expect(validateDepositAmount('9.99')).toBe(false);
    });

    it('returns true for amounts 10 or greater', () => {
      expect(validateDepositAmount('10')).toBe(true);
      expect(validateDepositAmount('10.00')).toBe(true);
      expect(validateDepositAmount('100')).toBe(true);
    });
  });
});
