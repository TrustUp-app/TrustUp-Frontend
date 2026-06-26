import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { authApi } from '../../api/auth';
import { usersApi } from '../../api/users';
import { ApiError } from '../../api/httpClient';
import { setTokens } from '../../auth/tokenStore';
import { signNonceWithWallet, buildVerifyPayload } from '../../auth/signing';

/**
 * Form field state for the create account form
 */
export interface CreateAccountFormState {
  profileImage: string | null;
  walletAddress: string;
  username: string;
  displayName: string;
  termsAccepted: boolean;
}

/**
 * Validation errors for the create account form
 */
export interface CreateAccountErrors {
  walletAddress: string;
  username: string;
  displayName: string;
  profileImage: string;
}

/**
 * Return type for the useCreateAccount hook
 */
export interface UseCreateAccountReturn {
  // Form state
  formState: CreateAccountFormState;
  errors: CreateAccountErrors;
  isSubmitting: boolean;
  showSuccess: boolean;

  // Field handlers
  handleWalletAddressChange: (text: string) => void;
  handleUsernameChange: (text: string) => void;
  handleDisplayNameChange: (text: string) => void;
  handleTermsAcceptedChange: (accepted: boolean) => void;

  // Actions
  pickImage: () => Promise<void>;
  createAccount: () => Promise<void>;
  resetSuccess: () => void;

  // Validation
  isFormValid: () => boolean;
}

const initialFormState: CreateAccountFormState = {
  profileImage: null,
  walletAddress: '',
  username: '',
  displayName: '',
  termsAccepted: false,
};

const initialErrors: CreateAccountErrors = {
  walletAddress: '',
  username: '',
  displayName: '',
  profileImage: '',
};

/**
 * Validates a Stellar wallet address
 * Stellar wallet addresses start with G and are 56 characters long
 */
export const validateWalletAddress = (address: string): boolean => {
  const stellarPattern = /^G[A-Z0-9]{55}$/;
  return stellarPattern.test(address);
};

/**
 * Cleans username input to only allow alphanumeric characters and underscores
 */
export const cleanUsername = (text: string): string => {
  return text.replace(/[^a-zA-Z0-9_]/g, '');
};

/**
 * Validates image file size (must be less than 2MB)
 */
const validateImageSize = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const sizeInMB = blob.size / (1024 * 1024);
    return sizeInMB <= 2;
  } catch {
    return false;
  }
};

/**
 * Validates image file type (must be JPG, PNG, or WebP)
 */
const validateImageType = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const blobType = blob.type.toLowerCase();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(blobType);
  } catch {
    return false;
  }
};

export const useCreateAccount = (): UseCreateAccountReturn => {
  const [formState, setFormState] = useState<CreateAccountFormState>(initialFormState);
  const [errors, setErrors] = useState<CreateAccountErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleWalletAddressChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, walletAddress: text }));

    if (text && !validateWalletAddress(text)) {
      setErrors((prev) => ({ ...prev, walletAddress: 'Invalid Stellar wallet address format' }));
    } else {
      setErrors((prev) => ({ ...prev, walletAddress: '' }));
    }
  }, []);

  const handleUsernameChange = useCallback((text: string) => {
    const cleanedText = cleanUsername(text);
    setFormState((prev) => ({ ...prev, username: cleanedText }));

    if (cleanedText.length > 0 && cleanedText.length < 3) {
      setErrors((prev) => ({ ...prev, username: 'Username must be at least 3 characters' }));
    } else {
      setErrors((prev) => ({ ...prev, username: '' }));
    }
  }, []);

  const handleDisplayNameChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, displayName: text }));

    if (text.length > 0 && text.length < 2) {
      setErrors((prev) => ({ ...prev, displayName: 'Display name must be at least 2 characters' }));
    } else {
      setErrors((prev) => ({ ...prev, displayName: '' }));
    }
  }, []);

  const handleTermsAcceptedChange = useCallback((accepted: boolean) => {
    setFormState((prev) => ({ ...prev, termsAccepted: accepted }));
  }, []);

  const pickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      try {
        const isSizeValid = await validateImageSize(imageUri);
        if (!isSizeValid) {
          setErrors((prev) => ({ ...prev, profileImage: 'File size must be less than 2MB' }));
          return;
        }

        const isTypeValid = await validateImageType(imageUri);
        if (!isTypeValid) {
          setErrors((prev) => ({
            ...prev,
            profileImage: 'Only JPG, PNG, and WebP formats are allowed',
          }));
          return;
        }

        setErrors((prev) => ({ ...prev, profileImage: '' }));
        setFormState((prev) => ({ ...prev, profileImage: imageUri }));
      } catch {
        setErrors((prev) => ({ ...prev, profileImage: 'Error processing image' }));
      }
    }
  }, []);

  const isFormValid = useCallback((): boolean => {
    const hasImageError = errors.profileImage !== '';

    return (
      formState.walletAddress.trim() !== '' &&
      validateWalletAddress(formState.walletAddress) &&
      formState.username.length >= 3 &&
      formState.displayName.length >= 2 &&
      formState.termsAccepted &&
      errors.walletAddress === '' &&
      errors.username === '' &&
      errors.displayName === '' &&
      !hasImageError
    );
  }, [formState, errors]);

  const createAccount = useCallback(async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      // 1) Nonce
      const nonceRes = await authApi.requestNonce(formState.walletAddress);
      const nonce = nonceRes.nonce;

      // 2) Sign + verify
      const signature = await signNonceWithWallet(formState.walletAddress, nonce);
      const verifyPayload = buildVerifyPayload({
        wallet: formState.walletAddress,
        nonce,
        signature,
      });

      const verifyRes = await authApi.verify(await verifyPayload);


      // Persist tokens
      await setTokens({
        accessToken: verifyRes.accessToken,
        refreshToken: verifyRes.refreshToken,
      });

      // 3) Update profile
      await usersApi.updateMe({
        walletAddress: formState.walletAddress,
        username: formState.username,
        displayName: formState.displayName,
        profileImage: formState.profileImage,
      });

      await usersApi.getMe();

      setShowSuccess(true);
    } catch (e) {
      const err = e as unknown;
      const message = err instanceof ApiError ? err.message : 'Failed to create account. Please try again.';
      Alert.alert('Account creation failed', message);
      setShowSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, formState]);

  const resetSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return {
    formState,
    errors,
    isSubmitting,
    showSuccess,

    handleWalletAddressChange,
    handleUsernameChange,
    handleDisplayNameChange,
    handleTermsAcceptedChange,

    pickImage,
    createAccount,
    resetSuccess,

    isFormValid,
  };
};

