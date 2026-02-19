import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateAccount } from '../../hooks/auth/use-create-account';

const CreateAccountScreen = ({ navigation }: any) => {
  const {
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
    isFormValid,
  } = useCreateAccount();

  const { profileImage, walletAddress, username, displayName, termsAccepted } = formState;

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
            onPress={() => handleTermsAcceptedChange(!termsAccepted)}
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
            onPress={createAccount}
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
