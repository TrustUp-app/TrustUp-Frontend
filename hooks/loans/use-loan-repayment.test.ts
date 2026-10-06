import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useLoanRepayment, type UseLoanRepaymentReturn } from './use-loan-repayment';
import { repayLoan } from '../../services/loans.service';
import { ApiError } from '../../lib/api';
import type { LoanPaymentResponse } from '../../types/api';

jest.mock('../../services/loans.service', () => ({
  repayLoan: jest.fn(),
}));

const mockedRepayLoan = repayLoan as jest.MockedFunction<typeof repayLoan>;

const repayment: LoanPaymentResponse = {
  unsignedXdr: 'UNSIGNED_XDR',
  preview: { paymentAmount: 10, currentBalance: 20, newBalance: 10, willComplete: false },
};
const hooks: HookHarness[] = [];

interface HookHarness {
  current: UseLoanRepaymentReturn;
  unmount: () => void;
}

function renderLoanRepaymentHook(): HookHarness {
  let current: UseLoanRepaymentReturn | null = null;

  function TestComponent() {
    current = useLoanRepayment();
    return null;
  }

  let renderer: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(React.createElement(TestComponent));
  });

  const hook = {
    get current() {
      if (!current) throw new Error('Hook did not render');
      return current;
    },
    unmount: () => {
      act(() => renderer.unmount());
      hooks.splice(hooks.indexOf(hook), 1);
    },
  };
  hooks.push(hook);
  return hook;
}

describe('useLoanRepayment', () => {
  beforeEach(() => {
    mockedRepayLoan.mockReset();
  });

  afterEach(() => {
    [...hooks].forEach((hook) => hook.unmount());
  });

  it('starts idle with no error or processing state', () => {
    const hook = renderLoanRepaymentHook();
    expect(hook.current.paymentStep).toBe('idle');
    expect(hook.current.isProcessing).toBe(false);
    expect(hook.current.error).toBeNull();
    expect(hook.current.stepLabel).toBe('');
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid payment amount %s', async (amount) => {
    const hook = renderLoanRepaymentHook();
    await act(async () => {
      await hook.current.initiatePayment('loan-123', amount);
    });
    expect(mockedRepayLoan).not.toHaveBeenCalled();
    expect(hook.current.paymentStep).toBe('failed');
    expect(hook.current.error).toBe('Invalid payment amount');
  });

  it('does not report ready to sign when unsigned XDR is missing', async () => {
    mockedRepayLoan.mockResolvedValue({ ...repayment, unsignedXdr: '' });
    const hook = renderLoanRepaymentHook();
    await act(async () => {
      await hook.current.initiatePayment('loan-123', 10);
    });
    expect(hook.current.paymentStep).toBe('failed');
    expect(hook.current.error).toBe('The repayment service did not return a transaction to sign.');
  });

  it('reports unexpected errors without claiming settlement', async () => {
    mockedRepayLoan.mockRejectedValue(new Error('offline'));
    const hook = renderLoanRepaymentHook();
    await act(async () => {
      await hook.current.initiatePayment('loan-123', 10);
    });
    expect(hook.current.paymentStep).toBe('failed');
    expect(hook.current.isProcessing).toBe(false);
    expect(hook.current.error).toBe('Unable to prepare payment. Please try again.');
  });

  it.each(['resolve', 'reject'] as const)('ignores a late %s after reset', async (outcome) => {
    let resolveRequest!: (value: LoanPaymentResponse) => void;
    let rejectRequest!: (reason: Error) => void;
    mockedRepayLoan.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolveRequest = resolve;
          rejectRequest = reject;
        })
    );
    const hook = renderLoanRepaymentHook();
    let pending!: Promise<void>;
    act(() => {
      pending = hook.current.initiatePayment(' loan-123 ', 10);
    });
    expect(hook.current.paymentStep).toBe('requesting');
    expect(hook.current.isProcessing).toBe(true);
    const signal = mockedRepayLoan.mock.calls[0][2];
    expect(mockedRepayLoan.mock.calls[0][0]).toBe('loan-123');
    act(() => hook.current.reset());
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      if (outcome === 'resolve') resolveRequest(repayment);
      else rejectRequest(new ApiError(500, 'Late error'));
      await pending;
    });
    expect(hook.current.paymentStep).toBe('idle');
    expect(hook.current.isProcessing).toBe(false);
    expect(hook.current.error).toBeNull();
  });

  it.each(['valid', 'invalid'] as const)(
    'ignores stale success after a new %s attempt',
    async (input) => {
      let resolveRequest!: (value: LoanPaymentResponse) => void;
      mockedRepayLoan
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveRequest = resolve;
            })
        )
        .mockRejectedValueOnce(new ApiError(422, 'New request failed'));
      const hook = renderLoanRepaymentHook();
      let pending!: Promise<void>;
      act(() => {
        pending = hook.current.initiatePayment('loan-123', 10);
      });
      const signal = mockedRepayLoan.mock.calls[0][2];
      await act(async () => {
        await hook.current.initiatePayment(input === 'valid' ? 'loan-456' : '', 10);
      });
      expect(signal?.aborted).toBe(true);
      await act(async () => {
        resolveRequest(repayment);
        await pending;
      });
      expect(hook.current.paymentStep).toBe('failed');
      expect(hook.current.error).toBe(input === 'valid' ? 'New request failed' : 'Invalid loan ID');
    }
  );

  it('rejects an empty loan ID without calling the API', async () => {
    const hook = renderLoanRepaymentHook();

    await act(async () => {
      await hook.current.initiatePayment('   ', 12.5);
    });

    expect(mockedRepayLoan).not.toHaveBeenCalled();
    expect(hook.current.paymentStep).toBe('failed');
    expect(hook.current.error).toBe('Invalid loan ID');
  });

  it('requests the repayment XDR with the selected installment amount', async () => {
    mockedRepayLoan.mockResolvedValue({
      unsignedXdr: 'UNSIGNED_XDR',
      preview: {
        paymentAmount: 102.66,
        currentBalance: 205.33,
        newBalance: 102.67,
        willComplete: false,
      },
    });
    const hook = renderLoanRepaymentHook();

    await act(async () => {
      await hook.current.initiatePayment('loan-123', 102.66);
    });

    expect(mockedRepayLoan).toHaveBeenCalledWith('loan-123', 102.66, expect.any(AbortSignal));
    expect(hook.current.paymentStep).toBe('readyToSign');
    expect(hook.current.stepLabel).toBe('Transaction ready for wallet signature.');
    expect(hook.current.isProcessing).toBe(false);
  });

  it('surfaces API failures and supports retrying after reset', async () => {
    mockedRepayLoan.mockRejectedValueOnce(new ApiError(422, 'Payment amount is no longer due'));
    const hook = renderLoanRepaymentHook();

    await act(async () => {
      await hook.current.initiatePayment('loan-123', 10);
    });

    expect(hook.current.paymentStep).toBe('failed');
    expect(hook.current.error).toBe('Payment amount is no longer due');

    act(() => {
      hook.current.reset();
    });

    expect(hook.current.paymentStep).toBe('idle');
    expect(hook.current.error).toBeNull();
  });

  it('aborts an in-flight request when unmounted', async () => {
    let requestSignal: AbortSignal | undefined;
    let resolveRequest: ((value: LoanPaymentResponse) => void) | undefined;
    mockedRepayLoan.mockImplementation(
      (_loanId, _amount, signal) =>
        new Promise((resolve: (value: LoanPaymentResponse) => void) => {
          requestSignal = signal;
          resolveRequest = resolve;
        })
    );
    const hook = renderLoanRepaymentHook();

    act(() => {
      void hook.current.initiatePayment('loan-123', 10);
    });

    act(() => {
      hook.unmount();
    });

    expect(requestSignal?.aborted).toBe(true);

    await act(async () => {
      resolveRequest?.({
        unsignedXdr: 'IGNORED_AFTER_UNMOUNT',
        preview: { paymentAmount: 10, currentBalance: 20, newBalance: 10, willComplete: false },
      });
    });
  });
});
