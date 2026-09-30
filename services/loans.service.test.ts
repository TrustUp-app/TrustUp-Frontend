import { repayLoan } from './loans.service';
import type { LoanPaymentResponse } from '../types/api';

const mockPost = jest.fn();
let mockApiConfigured = true;
jest.mock('../lib/api', () => ({
  get isApiConfigured() {
    return mockApiConfigured;
  },
  apiClient: { post: (...args: unknown[]) => mockPost(...args) },
}));

describe('repayLoan', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockApiConfigured = true;
  });

  it('posts the amount and cancellation signal to the loan repayment endpoint', async () => {
    const repayment: LoanPaymentResponse = {
      unsignedXdr: 'API_XDR',
      preview: { paymentAmount: 12.5, currentBalance: 25, newBalance: 12.5, willComplete: false },
    };
    mockPost.mockResolvedValue({ success: true, data: repayment });
    const controller = new AbortController();
    expect(await repayLoan('loan-123', 12.5, controller.signal)).toEqual(repayment);
    expect(mockPost).toHaveBeenCalledWith(
      '/loans/loan-123/pay',
      { amount: 12.5 },
      {
        signal: controller.signal,
      }
    );
  });

  it('propagates API failures instead of falling back to the seed', async () => {
    const error = new Error('Repayment rejected');
    mockPost.mockRejectedValue(error);
    await expect(repayLoan('loan-123', 12.5)).rejects.toBe(error);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('uses the DEV seed only when the API is unconfigured', async () => {
    mockApiConfigured = false;
    const result = await repayLoan('loan-123', 12.5);
    expect(result.unsignedXdr).toBe('DEV_UNSIGNED_XDR');
    expect(result.preview.paymentAmount).toBe(12.5);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
