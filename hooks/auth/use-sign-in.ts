import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '../../lib/api';
import { setToken } from '../../lib/auth-storage';

/**
 * Form field state for the sign-in form
 */
export interface SignInFormState {
  username: string;
  password: string;
  secureText: boolean;
}

/**
 * Validation errors for sign-in form
 */
export interface SignInErrors {
  username: string;
  password: string;
}

/**
 * Return type for useSignIn hook
 */
export interface UseSignInReturn {
  // Form state
  formState: SignInFormState;
  errors: SignInErrors;
  isSubmitting: boolean;
  isValid: boolean;

  // Field change handlers
  handleUsernameChange: (text: string) => void;
  handlePasswordChange: (text: string) => void;
  toggleSecureText: () => void;

  // Form submission
  handleSignIn: () => void;
}

/**
 * Auth login response. Accepts either `accessToken` (API docs) or `token`.
 */
interface LoginResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * Initial form state
 */
const initialFormState: SignInFormState = {
  username: '',
  password: '',
  secureText: true,
};

/**
 * Initial errors state
 */
const initialErrors: SignInErrors = {
  username: '',
  password: '',
};

/**
 * Custom hook for managing sign-in form state and validation.
 *
 * Calls `POST /auth/login` and persists the returned JWT.
 * When the backend switches to wallet nonce/verify, replace this handler
 * while keeping {@link setToken} + session gate in App.
 *
 * @param onSuccess Called after a successful sign in (once the token is stored).
 */
export const useSignIn = (onSuccess?: () => void): UseSignInReturn => {
  const [formState, setFormState] = useState<SignInFormState>(initialFormState);
  const [errors, setErrors] = useState<SignInErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field change handlers
  const handleUsernameChange = useCallback((text: string) => {
    setFormState((prev: SignInFormState) => ({ ...prev, username: text }));

    if (text.trim().length === 0) {
      setErrors((prev: SignInErrors) => ({ ...prev, username: 'Username is required' }));
    } else {
      setErrors((prev: SignInErrors) => ({ ...prev, username: '' }));
    }
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormState((prev: SignInFormState) => ({ ...prev, password: text }));

    if (text.trim().length === 0) {
      setErrors((prev: SignInErrors) => ({ ...prev, password: 'Password is required' }));
    } else {
      setErrors((prev: SignInErrors) => ({ ...prev, password: '' }));
    }
  }, []);

  const toggleSecureText = useCallback(() => {
    setFormState((prev: SignInFormState) => ({ ...prev, secureText: !prev.secureText }));
  }, []);

  // Form validation
  const isValid = useMemo(() => {
    return (
      formState.username.trim().length > 0 &&
      formState.password.trim().length > 0 &&
      errors.username === '' &&
      errors.password === ''
    );
  }, [formState, errors]);

  const handleSignIn = useCallback(async () => {
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const username = formState.username.trim().replace(/^@/, '');
      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: formState.password,
        }),
      });

      const token = result.accessToken ?? result.token;
      if (!token) {
        throw new Error('No access token returned from /auth/login');
      }

      await setToken(token);
      onSuccess?.();
    } catch (err) {
      Alert.alert(
        'Sign in failed',
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Check your credentials and API URL.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, formState.username, formState.password, onSuccess]);

  return {
    // Form state
    formState,
    errors,
    isSubmitting,
    isValid,

    // Field change handlers
    handleUsernameChange,
    handlePasswordChange,
    toggleSecureText,

    // Form submission
    handleSignIn,
  };
};
