import { useState, useCallback, useEffect } from 'react';

/**
 * Form field state for the sign in form
 */
export interface SignInFormState {
  username: string;
  password: string;
  secureText: boolean;
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
  toggleSecureText: () => void;

  // Actions
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
  const [isValid, setIsValid] = useState(false);

  // Form Validation Logic
  useEffect(() => {
    setIsValid(validateSignInForm(formState.username, formState.password));
  }, [formState.username, formState.password]);

  // Field change handlers
  const handleUsernameChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, username: text }));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, password: text }));
  }, []);

  const toggleSecureText = useCallback(() => {
    setFormState((prev) => ({ ...prev, secureText: !prev.secureText }));
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
    toggleSecureText,

    // Actions
    handleSignIn,
  };
};
