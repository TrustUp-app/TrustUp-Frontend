import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
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
      <View className="flex-row items-center border-b border-gray-100 bg-white px-6 pb-4 pt-12">
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          className="mr-3"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color="#343434" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#343434]">Create Account</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-8 pt-8">
          {/* Profile Picture Upload */}
          <View className="mb-6 items-center">
            <View className="relative">
              <View className="h-32 w-32 items-center justify-center rounded-full bg-white shadow-sm">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="h-32 w-32 rounded-full" />
                ) : (
                  <Ionicons name="person-outline" size={48} color="#8E8E8E" />
                )}
              </View>
              <TouchableOpacity
                onPress={pickImage}
                className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full bg-[#0F5257] shadow-md"
                accessibilityLabel="Upload profile picture">
                <Ionicons name="cloud-upload-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="mt-3 text-sm text-[#8E8E8E]">Upload profile picture (optional)</Text>
            {errors.profileImage ? (
              <Text className="mt-1 text-xs text-red-500">{errors.profileImage}</Text>
            ) : null}
          </View>

          {/* Wallet Address Input */}
          <View className="mb-4">
            <Text className="mb-2 text-sm text-[#8E8E8E]">Wallet Address</Text>
            <View className="flex-row items-center rounded-xl bg-white px-4 py-4 shadow-sm">
              <Ionicons name="wallet-outline" size={20} color="#8E8E8E" className="mr-3" />
              <TextInput
                placeholder="G..."
                placeholderTextColor="#BFBFBF"
                value={walletAddress}
                onChangeText={handleWalletAddressChange}
                className="ml-3 flex-1 text-base text-[#343434]"
                autoCapitalize="characters"
                accessibilityLabel="Wallet address input"
              />
            </View>
            {errors.walletAddress ? (
              <Text className="mt-1 text-xs text-red-500">{errors.walletAddress}</Text>
            ) : null}
          </View>

          {/* Username Input */}
          <View className="mb-4">
            <Text className="mb-2 text-sm text-[#8E8E8E]">Username</Text>
            <View className="flex-row items-center rounded-xl bg-white px-4 py-4 shadow-sm">
              <Ionicons name="person-outline" size={20} color="#8E8E8E" className="mr-3" />
              <Text className="ml-3 text-base text-[#343434]">@</Text>
              <TextInput
                placeholder="josue_crypto"
                placeholderTextColor="#BFBFBF"
                value={username}
                onChangeText={handleUsernameChange}
                className="ml-1 flex-1 text-base text-[#343434]"
                autoCapitalize="none"
                accessibilityLabel="Username input"
              />
            </View>
            {errors.username ? (
              <Text className="mt-1 text-xs text-red-500">{errors.username}</Text>
            ) : null}
          </View>

          {/* Display Name Input */}
          <View className="mb-6">
            <Text className="mb-2 text-sm text-[#8E8E8E]">Display Name</Text>
            <View className="flex-row items-center rounded-xl bg-white px-4 py-4 shadow-sm">
              <Ionicons name="person-outline" size={20} color="#8E8E8E" className="mr-3" />
              <TextInput
                placeholder="Josué Martínez"
                placeholderTextColor="#BFBFBF"
                value={displayName}
                onChangeText={handleDisplayNameChange}
                className="ml-3 flex-1 text-base text-[#343434]"
                accessibilityLabel="Display name input"
              />
            </View>
            {errors.displayName ? (
              <Text className="mt-1 text-xs text-red-500">{errors.displayName}</Text>
            ) : null}
          </View>

          {/* Info Box */}
          <View className="mb-6 flex-row rounded-xl bg-[#E0F2FE] p-4">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#0EA5E9]">
              <Ionicons name="information" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold text-[#0F5257]">
                Your wallet is your identity
              </Text>
              <Text className="text-xs leading-5 text-[#0F5257]">
                Make sure you have access to your wallet address. This will be used to verify your
                transactions and build your reputation.
              </Text>
            </View>
          </View>

          {/* Terms & Conditions Checkbox */}
          <TouchableOpacity
            onPress={() => handleTermsAcceptedChange(!termsAccepted)}
            className="mb-6 flex-row items-start"
            activeOpacity={0.7}
            accessibilityLabel="Accept terms and conditions"
            accessibilityRole="checkbox">
            <View
              className={`h-5 w-5 rounded ${termsAccepted ? 'bg-[#0F5257]' : 'border-2 border-gray-300 bg-white'} mr-3 mt-0.5 items-center justify-center`}>
              {termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="flex-1 text-sm text-[#8E8E8E]">
              By creating an account, you agree to our{' '}
              <Text className="font-semibold text-[#0F5257]">Terms of Service</Text> and{' '}
              <Text className="font-semibold text-[#0F5257]">Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={createAccount}
            disabled={!isFormValid() || isSubmitting}
            className={`flex-row items-center justify-center rounded-xl py-4 ${
              isFormValid() && !isSubmitting ? 'bg-[#FF9C6E]' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
            accessibilityLabel="Create account button">
            {isSubmitting ? (
              <>
                <Text className="mr-2 text-base font-semibold text-white">Creating Account...</Text>
                <Ionicons name="hourglass" size={18} color="white" />
              </>
            ) : (
              <>
                <Text
                  className={`mr-2 text-base font-semibold ${isFormValid() ? 'text-white' : 'text-gray-500'}`}>
                  Create Account
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isFormValid() ? 'white' : '#6B7280'}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Notification */}
      {showSuccess && (
        <View className="absolute left-6 right-6 top-20 flex-row items-center rounded-xl bg-[#10B981] p-4 shadow-lg">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-base font-bold text-white">
              Account Created Successfully!
            </Text>
            <Text className="text-sm text-white">Welcome to TrustUp, @{username}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateAccountScreen;
