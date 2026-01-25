import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const CreateAccountScreen = ({ navigation }: any) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [errors, setErrors] = useState({
    walletAddress: '',
    username: '',
    displayName: '',
    profileImage: '',
  });

  const validateWalletAddress = (address: string) => {
    // Stellar wallet addresses start with G and are 56 characters long
    const stellarPattern = /^G[A-Z0-9]{55}$/;
    return stellarPattern.test(address);
  };

  const pickImage = async () => {
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
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const sizeInMB = blob.size / (1024 * 1024);

        // Validate file size
        if (sizeInMB > 2) {
          setErrors({ ...errors, profileImage: 'File size must be less than 2MB' });
          return;
        }

        // Validate file type using blob.type (more reliable in web)
        const blobType = blob.type.toLowerCase();
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!validTypes.includes(blobType)) {
          setErrors({ ...errors, profileImage: 'Only JPG, PNG, and WebP formats are allowed' });
          return;
        }

        // All validations passed
        setErrors({ ...errors, profileImage: '' });
        setProfileImage(imageUri);
      } catch (error) {
        console.error('Error processing image:', error);
        setErrors({ ...errors, profileImage: 'Error processing image' });
      }
    }
  };

  const handleWalletAddressChange = (text: string) => {
    setWalletAddress(text);
    if (text && !validateWalletAddress(text)) {
      setErrors({ ...errors, walletAddress: 'Invalid Stellar wallet address format' });
    } else {
      setErrors({ ...errors, walletAddress: '' });
    }
  };

  const handleUsernameChange = (text: string) => {
    const cleanedText = text.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(cleanedText);
    if (cleanedText.length < 3) {
      setErrors({ ...errors, username: 'Username must be at least 3 characters' });
    } else {
      setErrors({ ...errors, username: '' });
    }
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    if (text.length < 2) {
      setErrors({ ...errors, displayName: 'Display name must be at least 2 characters' });
    } else {
      setErrors({ ...errors, displayName: '' });
    }
  };

  const isFormValid = () => {
    // Profile image is optional, but if there's an error with uploaded image, block submission
    const hasImageError = errors.profileImage !== '';

    return (
      walletAddress.trim() !== '' &&
      validateWalletAddress(walletAddress) &&
      username.length >= 3 &&
      displayName.length >= 2 &&
      termsAccepted &&
      errors.walletAddress === '' &&
      errors.username === '' &&
      errors.displayName === '' &&
      !hasImageError
    );
  };

  const handleCreateAccount = () => {
    if (isFormValid()) {
      setIsSubmitting(true);

      const accountData = {
        profileImage,
        walletAddress,
        username,
        displayName,
        termsAccepted,
      };

      console.log('✅ Account Created Successfully:', accountData);

      // Show success notification
      setShowSuccess(true);

      // Simulate account creation delay
      setTimeout(() => {
        setIsSubmitting(false);

        Alert.alert(
          '✅ Account Created!',
          `Welcome, ${displayName}!\n\nYour account has been created successfully.\n\nUsername: @${username}\nWallet: ${walletAddress.substring(0, 10)}...`,
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
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          className="mr-3"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#343434" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#343434]">Create Account</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-8">
          {/* Profile Picture Upload */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-sm">
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    className="w-32 h-32 rounded-full"
                  />
                ) : (
                  <Ionicons name="person-outline" size={48} color="#8E8E8E" />
                )}
              </View>
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#0F5257] rounded-full items-center justify-center shadow-md"
                accessibilityLabel="Upload profile picture"
              >
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-[#8E8E8E] text-sm mt-3">Upload profile picture (optional)</Text>
            {errors.profileImage ? (
              <Text className="text-red-500 text-xs mt-1">{errors.profileImage}</Text>
            ) : null}
          </View>

          {/* Wallet Address Input */}
          <View className="mb-4">
            <Text className="text-[#8E8E8E] text-sm mb-2">Wallet Address</Text>
            <View className="bg-white rounded-xl px-4 py-4 flex-row items-center shadow-sm">
              <Ionicons name="wallet-outline" size={20} color="#8E8E8E" className="mr-3" />
              <TextInput
                placeholder="G..."
                placeholderTextColor="#BFBFBF"
                value={walletAddress}
                onChangeText={handleWalletAddressChange}
                className="flex-1 text-[#343434] text-base ml-3"
                autoCapitalize="characters"
                accessibilityLabel="Wallet address input"
              />
            </View>
            {errors.walletAddress ? (
              <Text className="text-red-500 text-xs mt-1">{errors.walletAddress}</Text>
            ) : null}
          </View>

          {/* Username Input */}
          <View className="mb-4">
            <Text className="text-[#8E8E8E] text-sm mb-2">Username</Text>
            <View className="bg-white rounded-xl px-4 py-4 flex-row items-center shadow-sm">
              <Ionicons name="person-outline" size={20} color="#8E8E8E" className="mr-3" />
              <Text className="text-[#343434] text-base ml-3">@</Text>
              <TextInput
                placeholder="josue_crypto"
                placeholderTextColor="#BFBFBF"
                value={username}
                onChangeText={handleUsernameChange}
                className="flex-1 text-[#343434] text-base ml-1"
                autoCapitalize="none"
                accessibilityLabel="Username input"
              />
            </View>
            {errors.username ? (
              <Text className="text-red-500 text-xs mt-1">{errors.username}</Text>
            ) : null}
          </View>

          {/* Display Name Input */}
          <View className="mb-6">
            <Text className="text-[#8E8E8E] text-sm mb-2">Display Name</Text>
            <View className="bg-white rounded-xl px-4 py-4 flex-row items-center shadow-sm">
              <Ionicons name="person-outline" size={20} color="#8E8E8E" className="mr-3" />
              <TextInput
                placeholder="Josué Martínez"
                placeholderTextColor="#BFBFBF"
                value={displayName}
                onChangeText={handleDisplayNameChange}
                className="flex-1 text-[#343434] text-base ml-3"
                accessibilityLabel="Display name input"
              />
            </View>
            {errors.displayName ? (
              <Text className="text-red-500 text-xs mt-1">{errors.displayName}</Text>
            ) : null}
          </View>

          {/* Info Box */}
          <View className="bg-[#E0F2FE] rounded-xl p-4 flex-row mb-6">
            <View className="w-10 h-10 bg-[#0EA5E9] rounded-full items-center justify-center mr-3">
              <Ionicons name="information" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[#0F5257] font-semibold text-sm mb-1">
                Your wallet is your identity
              </Text>
              <Text className="text-[#0F5257] text-xs leading-5">
                Make sure you have access to your wallet address. This will be used to verify your transactions and build your reputation.
              </Text>
            </View>
          </View>

          {/* Terms & Conditions Checkbox */}
          <TouchableOpacity
            onPress={() => setTermsAccepted(!termsAccepted)}
            className="flex-row items-start mb-6"
            activeOpacity={0.7}
            accessibilityLabel="Accept terms and conditions"
            accessibilityRole="checkbox"
          >
            <View className={`w-5 h-5 rounded ${termsAccepted ? 'bg-[#0F5257]' : 'bg-white border-2 border-gray-300'} items-center justify-center mr-3 mt-0.5`}>
              {termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="text-[#8E8E8E] text-sm flex-1">
              By creating an account, you agree to our{' '}
              <Text className="text-[#0F5257] font-semibold">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-[#0F5257] font-semibold">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            disabled={!isFormValid() || isSubmitting}
            className={`rounded-xl py-4 items-center flex-row justify-center ${
              isFormValid() && !isSubmitting ? 'bg-[#FF9C6E]' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
            accessibilityLabel="Create account button"
          >
            {isSubmitting ? (
              <>
                <Text className="font-semibold text-base mr-2 text-white">
                  Creating Account...
                </Text>
                <Ionicons name="hourglass" size={18} color="white" />
              </>
            ) : (
              <>
                <Text className={`font-semibold text-base mr-2 ${isFormValid() ? 'text-white' : 'text-gray-500'}`}>
                  Create Account
                </Text>
                <Ionicons name="arrow-forward" size={18} color={isFormValid() ? 'white' : '#6B7280'} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Notification */}
      {showSuccess && (
        <View className="absolute top-20 left-6 right-6 bg-[#10B981] rounded-xl shadow-lg p-4 flex-row items-center">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base mb-1">
              Account Created Successfully!
            </Text>
            <Text className="text-white text-sm">
              Welcome to TrustUp, @{username}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateAccountScreen;
