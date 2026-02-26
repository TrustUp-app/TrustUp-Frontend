import { useState, useCallback, useMemo } from 'react';

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
 * Custom hook for managing sign-in form state and validation
 */
export const useSignIn = (): UseSignInReturn => {
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

  // Sign-in handler
  const handleSignIn = useCallback(() => {
    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Sign In Data:', {
        username: formState.username,
        password: formState.password,
      });
      setIsSubmitting(false);
    }, 1000);
  }, [isValid, formState]);

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
