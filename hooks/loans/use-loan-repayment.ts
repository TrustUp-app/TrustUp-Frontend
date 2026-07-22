import { useState, useCallback } from 'react';

/**
 * Steps in the repayment transaction flow.
 * 1. idle → nothing happening
 * 2. requesting → calling POST /loans/:loanId/pay to get unsigned XDR
 * 3. signing → waiting for wallet to sign the XDR
 * 4. submitting → calling POST /transactions/submit with signed XDR
 * 5. success → payment completed
 * 6. failed → an error occurred at any step
 */
export type PaymentStep = 'idle' | 'requesting' | 'signing' | 'submitting' | 'success' | 'failed';

/**
 * Human-readable label for each payment step, shown in the UI.
 */
export const PAYMENT_STEP_LABELS: Record<PaymentStep, string> = {
  idle: '',
  requesting: 'Preparing transaction…',
  signing: 'Waiting for wallet signature…',
  submitting: 'Submitting to network…',
  success: 'Payment successful!',
  failed: 'Payment failed',
};

/**
 * Return type for the useLoanRepayment hook.
 */
export interface UseLoanRepaymentReturn {
  isProcessing: boolean;
  paymentStep: PaymentStep;
  stepLabel: string;
  error: string | null;
  initiatePayment: (loanId: string) => void;
  reset: () => void;
}

/**
 * Custom hook for the 3-step loan repayment flow:
 * 1. Request unsigned XDR from API
 * 2. Sign with connected wallet
 * 3. Submit signed transaction
 *
 * @todo Replace each setTimeout block with real API calls:
 *   Step 1 – POST /loans/{loanId}/pay          → receive unsigned XDR
 *   Step 2 – Invoke connected wallet to sign XDR
 *   Step 3 – POST /transactions/submit          → submit signed XDR
 *
 * Until the endpoints are available this function uses simulated delays so
 * that the UI flow can be developed and reviewed. It MUST NOT ship to
 * production in this state.
 */
export const useLoanRepayment = (): UseLoanRepaymentReturn => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const isProcessing =
    paymentStep !== 'idle' && paymentStep !== 'success' && paymentStep !== 'failed';

  const stepLabel = PAYMENT_STEP_LABELS[paymentStep];

  /**
   * Kicks off the full repayment pipeline for the given loan.
   */
  const initiatePayment = useCallback((loanId: string) => {
    if (!loanId || loanId.trim() === '') {
      setError('Invalid loan ID');
      setPaymentStep('failed');
      return;
    }

    setError(null);
    setPaymentStep('requesting');

    // TODO: Step 1 – POST /loans/${loanId}/pay to receive unsigned XDR
    setTimeout(() => {
      // TODO: Step 2 – Pass unsignedXdr to the connected wallet for signing
      setPaymentStep('signing');
      setTimeout(() => {
        // TODO: Step 3 – POST /transactions/submit with the signed XDR
        setPaymentStep('submitting');
        setTimeout(() => {
          setPaymentStep('success');
        }, 1200);
      }, 1500);
    }, 1000);
  }, []);

  /**
   * Resets the hook back to idle state so the user can retry or dismiss.
   */
  const reset = useCallback(() => {
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
