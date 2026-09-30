import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import LoanDetailScreen from './LoanDetailScreen';
import { repayLoan } from '../../services/loans.service';
import { ApiError } from '../../lib/api';
import type { Loan } from '../../types/Loan';
import type { LoanPaymentResponse } from '../../types/api';

jest.mock('../../services/loans.service', () => ({ repayLoan: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockedRepayLoan = repayLoan as jest.MockedFunction<typeof repayLoan>;
const loan: Loan = {
  id: 'loan-123',
  merchantName: 'TechStore',
  merchantId: 'merchant-1',
  amount: 100,
  amountPaid: 50,
  interestRate: 3,
  totalWithInterest: 103,
  status: 'active',
  installmentCount: 2,
  installments: [],
  nextPaymentDue: '2026-10-01',
  nextPaymentAmount: 26.5,
  createdAt: '2026-09-01',
  completedAt: null,
};
const repayment: LoanPaymentResponse = {
  unsignedXdr: 'UNSIGNED_XDR',
  preview: { paymentAmount: 26.5, currentBalance: 53, newBalance: 26.5, willComplete: false },
};

describe('Loan Detail repayment overlay', () => {
  let screen: TestRenderer.ReactTestRenderer;

  beforeEach(() => {
    mockedRepayLoan.mockReset();
    act(() => {
      screen = TestRenderer.create(
        React.createElement(LoanDetailScreen, { loan, onBack: jest.fn() })
      );
    });
  });

  afterEach(() => act(() => screen.unmount()));

  const hasText = (text: string) =>
    screen.root.findAllByType(Text).some((node) => node.props.children === text);
  const paymentButton = () =>
    screen.root
      .findAllByType(TouchableOpacity)
      .find((node) => node.props.accessibilityLabel === 'Make a payment')!;
  const dismissButton = () =>
    screen.root
      .findAllByType(TouchableOpacity)
      .find((node) =>
        node
          .findAllByType(Text)
          .some((text) => text.props.children === 'Close' || text.props.children === 'Try Again')
      )!;

  it('passes the installment amount, shows requesting, then ready to sign and dismisses', async () => {
    let resolveRequest!: (value: LoanPaymentResponse) => void;
    mockedRepayLoan.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );
    let pending!: Promise<void>;
    act(() => {
      pending = paymentButton().props.onPress();
    });
    expect(mockedRepayLoan).toHaveBeenCalledWith('loan-123', 26.5, expect.any(AbortSignal));
    expect(paymentButton().props.disabled).toBe(true);
    expect(hasText('Preparing Payment')).toBe(true);
    await act(async () => {
      resolveRequest(repayment);
      await pending;
    });
    expect(hasText('Ready to Sign')).toBe(true);
    expect(hasText('Transaction ready for wallet signature.')).toBe(true);
    expect(hasText('Payment Successful!')).toBe(false);
    act(() => dismissButton().props.onPress());
    expect(hasText('Ready to Sign')).toBe(false);
    expect(paymentButton().props.disabled).toBe(false);
  });

  it('shows API errors, dismisses the error and permits another request', async () => {
    mockedRepayLoan
      .mockRejectedValueOnce(new ApiError(422, 'Installment no longer due'))
      .mockResolvedValueOnce(repayment);
    await act(async () => {
      await paymentButton().props.onPress();
    });
    expect(hasText('Payment Failed')).toBe(true);
    expect(hasText('Installment no longer due')).toBe(true);
    act(() => dismissButton().props.onPress());
    expect(hasText('Payment Failed')).toBe(false);
    await act(async () => {
      await paymentButton().props.onPress();
    });
    expect(mockedRepayLoan).toHaveBeenCalledTimes(2);
    expect(hasText('Ready to Sign')).toBe(true);
  });
});
