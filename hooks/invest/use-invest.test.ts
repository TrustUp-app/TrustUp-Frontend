import { formatCurrency, validateDepositAmount } from './use-invest';
import { investService } from '../../services/invest.service';
import { apiClient } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedPost = apiClient.post as unknown as jest.Mock;

describe('useInvest utility functions', () => {
  describe('formatCurrency', () => {
    it('returns empty string for empty or invalid input', () => {
      expect(formatCurrency('')).toBe('');
      expect(formatCurrency('abc')).toBe('');
    });

    it('formats valid numbers preserving decimal precision', () => {
      expect(formatCurrency('10')).toBe('10');
      expect(formatCurrency('10.5')).toBe('10.5');
      expect(formatCurrency('10.55')).toBe('10.55');
    });

    it('filters out non-numeric characters and adds thousand separators', () => {
      expect(formatCurrency('$10.50')).toBe('10.50');
      expect(formatCurrency('10,000.50')).toBe('10,000.50');
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

describe('investService.deposit', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('POSTs the numeric amount to the real /liquidity/deposit route', async () => {
    const response = {
      unsignedXdr: 'AAAAAgAAAAA...',
      description: 'Deposit $25 into liquidity pool',
      preview: {
        depositAmount: 25,
        sharesReceived: 23.14,
        currentSharePrice: 1.08,
        newTotalValue: 2500025,
        currentTotalLiquidity: 2500000,
      },
    };
    mockedPost.mockResolvedValue(response);

    const result = await investService.deposit({ amount: 25 });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith('/liquidity/deposit', { amount: 25 });
    expect(result).toEqual(response);
  });

  it('propagates API errors so the screen can surface them', async () => {
    mockedPost.mockRejectedValue(new Error('Minimum deposit amount is $10'));

    await expect(investService.deposit({ amount: 5 })).rejects.toThrow(
      'Minimum deposit amount is $10'
    );
  });
});
