import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth.context';
import { ApiError } from '../../lib/api';

export interface SignInFormState {
  wallet: string;
  password: string;
  secureText: boolean;
}

export interface SignInErrors {
  wallet: string;
  password: string;
  general: string;
}

export interface UseSignInReturn {
  formState: SignInFormState;
  errors: SignInErrors;
  isSubmitting: boolean;
  isValid: boolean;

  handleWalletChange: (text: string) => void;
  handlePasswordChange: (text: string) => void;
  toggleSecureText: () => void;

  handleSignIn: () => void;
}

const initialFormState: SignInFormState = {
  wallet: '',
  password: '',
  secureText: true,
};

const initialErrors: SignInErrors = {
  wallet: '',
  password: '',
  general: '',
};

/**
 * Custom hook for managing sign-in form state and validation.
 *
 * Delegates the actual API call + token/session handling to AuthContext's
 * `signIn` — this hook owns only form UI state, so context stays the single
 * source of truth for `user`/`token`.
 *
 * @param onSuccess Called after a successful sign in.
 */
export const useSignIn = (onSuccess?: () => void): UseSignInReturn => {
  const { signIn } = useAuth();
  const [formState, setFormState] = useState<SignInFormState>(initialFormState);
  const [errors, setErrors] = useState<SignInErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWalletChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, wallet: text }));
    setErrors((prev) => ({
      ...prev,
      wallet: text.trim().length === 0 ? 'Wallet address is required' : '',
      general: '',
    }));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, password: text }));
    setErrors((prev) => ({
      ...prev,
      password: text.trim().length === 0 ? 'Password is required' : '',
      general: '',
    }));
  }, []);

  const toggleSecureText = useCallback(() => {
    setFormState((prev) => ({ ...prev, secureText: !prev.secureText }));
  }, []);

  const isValid = useMemo(
    () =>
      formState.wallet.trim().length > 0 &&
      formState.password.trim().length > 0 &&
      errors.wallet === '' &&
      errors.password === '',
    [formState, errors]
  );

  const handleSignIn = useCallback(async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      await signIn(formState.wallet.trim(), formState.password);
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Unable to sign in. Check your credentials and try again.';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, formState.wallet, formState.password, signIn, onSuccess]);

  return {
    formState,
    errors,
    isSubmitting,
    isValid,
    handleWalletChange,
    handlePasswordChange,
    toggleSecureText,
    handleSignIn,
  };
};
