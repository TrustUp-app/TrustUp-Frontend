import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fetchNonce, verifySignature } from '../../api/auth';
import { updateMe } from '../../api/users';
import { saveAccessToken, saveRefreshToken } from '../../lib/tokenStorage';
import { ApiError } from '../../lib/apiClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateAccountFormState {
  profileImage: string | null;
  walletAddress: string;
  username: string;
  displayName: string;
  termsAccepted: boolean;
}

export interface CreateAccountErrors {
  walletAddress: string;
  username: string;
  displayName: string;
  profileImage: string;
}

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

// ─── Initial state ────────────────────────────────────────────────────────────

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

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Validates a Stellar wallet address.
 * Stellar addresses start with G and are 56 characters long.
 */
export const validateWalletAddress = (address: string): boolean => {
  const stellarPattern = /^G[A-Z0-9]{55}$/;
  return stellarPattern.test(address);
};

/**
 * Strips characters that are not alphanumeric or underscores.
 */
export const cleanUsername = (text: string): string => {
  return text.replace(/[^a-zA-Z0-9_]/g, '');
};

const validateImageSize = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size / (1024 * 1024) <= 2;
  } catch {
    return false;
  }
};

const validateImageType = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(blob.type.toLowerCase());
  } catch {
    return false;
  }
};

/**
 * Signs a nonce with the given Stellar wallet address.
 *
 * NOTE: Stellar transaction signing requires access to the wallet's secret key
 * or a browser-extension wallet such as Freighter. The exact signing mechanism
 * depends on the wallet integration chosen for this app.
 *
 * Current implementation: returns the nonce string as a placeholder signature
 * so the rest of the auth flow can be developed and tested end-to-end. Replace
 * this function with the real signing logic once the wallet SDK is integrated
 * (e.g. Freighter's signTransaction / signMessage, or StellarSdk.Keypair).
 *
 * @param walletAddress - The public Stellar wallet address (G…)
 * @param nonce         - The nonce string returned by POST /auth/nonce
 * @returns             - A signature string to send to POST /auth/verify
 */
async function signNonce(walletAddress: string, nonce: string): Promise<string> {
  // TODO: replace with real wallet signing logic.
  // Example using Freighter:
  //   import { signMessage } from '@stellar/freighter-api';
  //   return signMessage(nonce, walletAddress);
  return nonce;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCreateAccount = (
  onSuccess?: () => void
): UseCreateAccountReturn => {
  const [formState, setFormState] = useState<CreateAccountFormState>(initialFormState);
  const [errors, setErrors] = useState<CreateAccountErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Field handlers ──────────────────────────────────────────────────────────

  const handleWalletAddressChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, walletAddress: text }));
    setErrors((prev) => ({
      ...prev,
      walletAddress:
        text && !validateWalletAddress(text) ? 'Invalid Stellar wallet address format' : '',
    }));
  }, []);

  const handleUsernameChange = useCallback((text: string) => {
    const cleaned = cleanUsername(text);
    setFormState((prev) => ({ ...prev, username: cleaned }));
    setErrors((prev) => ({
      ...prev,
      username:
        cleaned.length > 0 && cleaned.length < 3
          ? 'Username must be at least 3 characters'
          : '',
    }));
  }, []);

  const handleDisplayNameChange = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, displayName: text }));
    setErrors((prev) => ({
      ...prev,
      displayName:
        text.length > 0 && text.length < 2
          ? 'Display name must be at least 2 characters'
          : '',
    }));
  }, []);

  const handleTermsAcceptedChange = useCallback((accepted: boolean) => {
    setFormState((prev) => ({ ...prev, termsAccepted: accepted }));
  }, []);

  // ── Image picker ────────────────────────────────────────────────────────────

  const pickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const imageUri = result.assets[0].uri;
      try {
        if (!(await validateImageSize(imageUri))) {
          setErrors((prev) => ({ ...prev, profileImage: 'File size must be less than 2MB' }));
          return;
        }
        if (!(await validateImageType(imageUri))) {
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

  // ── Validation ──────────────────────────────────────────────────────────────

  const isFormValid = useCallback((): boolean => {
    return (
      formState.walletAddress.trim() !== '' &&
      validateWalletAddress(formState.walletAddress) &&
      formState.username.length >= 3 &&
      formState.displayName.length >= 2 &&
      formState.termsAccepted &&
      errors.walletAddress === '' &&
      errors.username === '' &&
      errors.displayName === '' &&
      errors.profileImage === ''
    );
  }, [formState, errors]);

  // ── Account creation — real API flow ────────────────────────────────────────

  const createAccount = useCallback(async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // 1. Fetch nonce from the backend
      const { nonce, expiresAt } = await fetchNonce(formState.walletAddress);

      // Validate nonce expiry client-side
      if (new Date(expiresAt) <= new Date()) {
        Alert.alert('Session Expired', 'The authentication nonce has expired. Please try again.');
        return;
      }

      // 2. Sign the nonce with the wallet
      const signature = await signNonce(formState.walletAddress, nonce);

      // 3. Verify signature — registers or logs in the user
      const { accessToken, refreshToken } = await verifySignature({
        wallet: formState.walletAddress,
        nonce,
        signature,
      });

      // 4. Persist tokens securely
      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);

      // 5. Sync profile data with the backend
      await updateMe({
        username: formState.username,
        displayName: formState.displayName,
        profileImage: formState.profileImage,
      });

      // 6. Show success banner, then navigate
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 1200);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please check your connection and try again.';
      Alert.alert('Account Creation Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, formState, onSuccess]);

  // ── Reset ───────────────────────────────────────────────────────────────────

  const resetSuccess = useCallback(() => setShowSuccess(false), []);

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