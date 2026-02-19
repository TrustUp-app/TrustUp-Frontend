import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
  createAccount: () => void;
  resetSuccess: () => void;

  // Validation
  isFormValid: () => boolean;
}

/**
 * Initial form state
 */
const initialFormState: CreateAccountFormState = {
  profileImage: null,
  walletAddress: '',
  username: '',
  displayName: '',
  termsAccepted: false,
};

/**
 * Initial errors state
 */
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

/**
 * Custom hook for Create Account functionality
 * Handles all form state, validation, and account creation logic
 */
export const useCreateAccount = (): UseCreateAccountReturn => {
  const [formState, setFormState] = useState<CreateAccountFormState>(initialFormState);
  const [errors, setErrors] = useState<CreateAccountErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Field change handlers
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

  // Image picking with validation
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
        // Validate file size
        const isSizeValid = await validateImageSize(imageUri);
        if (!isSizeValid) {
          setErrors((prev) => ({ ...prev, profileImage: 'File size must be less than 2MB' }));
          return;
        }

        // Validate file type
        const isTypeValid = await validateImageType(imageUri);
        if (!isTypeValid) {
          setErrors((prev) => ({
            ...prev,
            profileImage: 'Only JPG, PNG, and WebP formats are allowed',
          }));
          return;
        }

        // All validations passed
        setErrors((prev) => ({ ...prev, profileImage: '' }));
        setFormState((prev) => ({ ...prev, profileImage: imageUri }));
      } catch (error) {
        console.error('Error processing image:', error);
        setErrors((prev) => ({ ...prev, profileImage: 'Error processing image' }));
      }
    }
  }, []);

  // Form validation
  const isFormValid = useCallback((): boolean => {
    // Profile image is optional, but if there's an error with uploaded image, block submission
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

  // Account creation handler
  const createAccount = useCallback(() => {
    if (isFormValid()) {
      setIsSubmitting(true);

      const accountData = {
        profileImage: formState.profileImage,
        walletAddress: formState.walletAddress,
        username: formState.username,
        displayName: formState.displayName,
        termsAccepted: formState.termsAccepted,
      };

      console.log('✅ Account Created Successfully:', accountData);

      // Show success notification
      setShowSuccess(true);

      // Simulate account creation delay
      setTimeout(() => {
        setIsSubmitting(false);

        Alert.alert(
          '✅ Account Created!',
          `Welcome, ${formState.displayName}!\n\nYour account has been created successfully.\n\nUsername: @${formState.username}\nWallet: ${formState.walletAddress.substring(0, 10)}...`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowSuccess(false);
                console.log('Account creation confirmed');
              },
            },
          ]
        );
      }, 500);
    }
  }, [isFormValid, formState]);

  // Reset success state
  const resetSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return {
    // Form state
    formState,
    errors,
    isSubmitting,
    showSuccess,

    // Field handlers
    handleWalletAddressChange,
    handleUsernameChange,
    handleDisplayNameChange,
    handleTermsAcceptedChange,

    // Actions
    pickImage,
    createAccount,
    resetSuccess,

    // Validation
    isFormValid,
  };
};
