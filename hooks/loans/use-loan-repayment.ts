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
export type PaymentStep =
  | 'idle'
  | 'requesting'
  | 'signing'
  | 'submitting'
  | 'success'
  | 'failed';

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
 * Currently uses simulated delays. Replace the setTimeout
 * blocks with real API calls in production.
 */
export const useLoanRepayment = (): UseLoanRepaymentReturn => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const isProcessing = paymentStep !== 'idle' && paymentStep !== 'success' && paymentStep !== 'failed';

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

    // Step 1: Request unsigned XDR
    console.log(`POST /loans/${loanId}/pay → requesting unsigned XDR`);
    setTimeout(() => {
      const unsignedXdr = 'AAAA...mock-unsigned-xdr...ZZZZ';
      console.log('Received unsigned XDR:', unsignedXdr.substring(0, 20) + '…');

      // Step 2: Sign with wallet
      setPaymentStep('signing');
      console.log('Requesting wallet signature…');
      setTimeout(() => {
        const signedXdr = 'BBBB...mock-signed-xdr...YYYY';
        console.log('Wallet signed XDR:', signedXdr.substring(0, 20) + '…');

        // Step 3: Submit signed transaction
        setPaymentStep('submitting');
        console.log('POST /transactions/submit');
        setTimeout(() => {
          // Simulate success (in production, handle API errors here)
          console.log(`✅ Payment for loan ${loanId} submitted successfully`);
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
