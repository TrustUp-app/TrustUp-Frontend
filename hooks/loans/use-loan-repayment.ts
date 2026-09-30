import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../lib/api';
import { repayLoan } from '../../services/loans.service';

/** States for requesting an unsigned repayment transaction. */
export type PaymentStep = 'idle' | 'requesting' | 'readyToSign' | 'failed';

export const PAYMENT_STEP_LABELS: Record<PaymentStep, string> = {
  idle: '',
  requesting: 'Preparing transaction...',
  readyToSign: 'Transaction ready for wallet signature.',
  failed: 'Payment failed',
};

export interface UseLoanRepaymentReturn {
  isProcessing: boolean;
  paymentStep: PaymentStep;
  stepLabel: string;
  error: string | null;
  initiatePayment: (loanId: string, amount: number) => Promise<void>;
  reset: () => void;
}

/**
 * Requests an unsigned repayment XDR from the API. Wallet signing and network
 * submission are intentionally out of scope until wallet integration exists,
 * so a successful response is never presented as a settled payment.
 */
export const useLoanRepayment = (): UseLoanRepaymentReturn => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const activeRequestRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const isProcessing = paymentStep === 'requesting';
  const stepLabel = PAYMENT_STEP_LABELS[paymentStep];

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeRequestRef.current += 1;
      controllerRef.current?.abort();
    };
  }, []);

  const initiatePayment = useCallback(async (loanId: string, amount: number): Promise<void> => {
    if (!isMountedRef.current) return;

    // Invalidate the previous attempt even if the new input is invalid.
    activeRequestRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;

    const normalizedLoanId = loanId.trim();
    if (!normalizedLoanId) {
      setError('Invalid loan ID');
      setPaymentStep('failed');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Invalid payment amount');
      setPaymentStep('failed');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = activeRequestRef.current;

    setError(null);
    setPaymentStep('requesting');

    try {
      const repayment = await repayLoan(normalizedLoanId, amount, controller.signal);
      if (
        controller.signal.aborted ||
        !isMountedRef.current ||
        activeRequestRef.current !== requestId
      ) {
        return;
      }

      if (!repayment.unsignedXdr) {
        throw new ApiError(502, 'The repayment service did not return a transaction to sign.');
      }

      setPaymentStep('readyToSign');
    } catch (err) {
      if (
        controller.signal.aborted ||
        !isMountedRef.current ||
        activeRequestRef.current !== requestId
      ) {
        return;
      }

      setError(
        err instanceof ApiError ? err.message : 'Unable to prepare payment. Please try again.'
      );
      setPaymentStep('failed');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  }, []);

  const reset = useCallback(() => {
    activeRequestRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    setPaymentStep('idle');
    setError(null);
  }, []);

  return {
    isProcessing,
    paymentStep,
    stepLabel,
    error,
    initiatePayment,
    reset,
  };
};
