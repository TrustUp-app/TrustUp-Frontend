import { useState, useCallback } from 'react';

/**
 * Form field state for the sign in form
 */
export interface SignInFormState {
  username: string;
  password: string;
}

/**
 * Return type for the useSignIn hook
 */
export interface UseSignInReturn {
  // Form state
  formState: SignInFormState;
  isValid: boolean;

  // Field handlers
  handleUsernameChange: (text: string) => void;
  handlePasswordChange: (text: string) => void;

  // Actions
  handleSignIn: () => void;
}

/**
 * Initial form state
 */
const initialFormState: SignInFormState = {
  username: '',
  password: '',
};

/**
 * Validates if the sign in form is valid
 * Both username and password must be non-empty
 */
export const validateSignInForm = (username: string, password: string): boolean => {
  return username.trim().length > 0 && password.trim().length > 0;
};

/**
 * Custom hook for Sign In functionality
 * Handles all form state, validation, and sign in logic
 */
export const useSignIn = (): UseSignInReturn => {
  const [formState, setFormState] = useState<SignInFormState>(initialFormState);

  // Derived validation — computed every render, no stale state possible
  const isValid = validateSignInForm(formState.username, formState.password);

  // Field change handlers
  const handleUsernameChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, username: text }));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, password: text }));
  }, []);

  // Sign in handler
  const handleSignIn = useCallback(() => {
    console.log('Form Data:', { username: formState.username, password: formState.password });
  }, [formState.username, formState.password]);

  return {
    // Form state
    formState,
    isValid,

    // Field handlers
    handleUsernameChange,
    handlePasswordChange,

    // Actions
    handleSignIn,
  };
};
