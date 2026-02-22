import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInvest } from '../../hooks/invest/use-invest';

const InvestScreen = () => {
  const {
    depositAmount,
    scrollViewRef,
    formatCurrency,
    handleAmountChange,
    isDepositValid,
    handleDeposit,
  } = useInvest();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollViewRef}
          className="bg-[#F5F5F5]"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-6 pt-6">
            {/* Page Title */}
            <Text className="mb-6 text-2xl font-bold text-[#343434]">Invest in TrustUp</Text>

            {/* Investment Card */}
            <View
              className="mb-4 rounded-2xl bg-white p-6 shadow-sm"
              accessibilityRole="summary"
              accessibilityLabel="Your investment summary">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E9D5FF]">
                  <Ionicons name="trending-up" size={20} color="#9333EA" />
                </View>
                <Text className="text-base font-medium text-[#6B7280]">Your Investment</Text>
              </View>

              {/* Total Invested */}
              <View className="mb-4">
                <Text className="mb-1 text-sm text-[#9CA3AF]">Total Invested</Text>
                <Text className="text-5xl font-bold text-[#1F2937]">$1,250.00</Text>
              </View>

              {/* Earnings */}
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-[#9CA3AF]">Earnings</Text>
                <Text className="text-base font-semibold text-[#10B981]">+$42.30</Text>
              </View>

              {/* Progress Line */}
              <View className="mb-4 h-1 rounded-full bg-[#10B981]" />

              {/* APY and Return Rate Row */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-sm text-[#9CA3AF]">Estimated APY</Text>
                  <Text className="text-3xl font-bold text-[#1F2937]">5.2%</Text>
                </View>
                <View className="items-end">
                  <Text className="mb-1 text-sm text-[#9CA3AF]">Return Rate</Text>
                  <Text className="text-base font-semibold text-[#10B981]">+3.4%</Text>
                </View>
              </View>
            </View>

            {/* Fund Overview Card */}
            <View
              className="mb-4 rounded-2xl bg-white p-6 shadow-sm"
              accessibilityRole="summary"
              accessibilityLabel="Fund overview information">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#D1FAE5]">
                  <Text className="text-xl font-bold text-[#10B981]">$</Text>
                </View>
                <Text className="text-base font-medium text-[#6B7280]">Fund Overview</Text>
              </View>

              {/* Pool Size */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-[#9CA3AF]">Pool Size</Text>
                <Text className="text-base font-semibold text-[#1F2937]">$48,320</Text>
              </View>

              {/* Active Loans */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-[#9CA3AF]">Active Loans</Text>
                <Text className="text-base font-semibold text-[#1F2937]">36</Text>
              </View>

              {/* Risk Level */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-[#9CA3AF]">Risk Level</Text>
                <View className="rounded-full bg-[#D1FAE5] px-3 py-1">
                  <Text className="text-xs font-semibold text-[#10B981]">Low</Text>
                </View>
              </View>

              {/* Disclaimer Text */}
              <Text className="mt-1 text-xs text-[#9CA3AF]">
                Returns depend on borrower behavior
              </Text>
            </View>

            {/* Deposit Card */}
            <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xl font-bold text-[#1F2937]">Deposit Funds</Text>

              {/* Amount Input Field */}
              <View className="mb-4">
                <Text className="mb-2 text-sm text-[#9CA3AF]">Amount to invest</Text>
                <TextInput
                  className="mb-2 text-5xl font-bold text-[#1F2937]"
                  keyboardType="numeric"
                  value={depositAmount ? `$${depositAmount}` : ''}
                  onChangeText={handleAmountChange}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 600, animated: true });
                    }, 150);
                  }}
                  placeholder="$0.00"
                  placeholderTextColor="#D1D5DB"
                  accessibilityLabel="Amount to invest input field"
                  accessibilityHint="Enter the amount you want to invest, minimum $10"
                />
                <Text className="text-xs text-[#9CA3AF]">Minimum deposit $10</Text>
              </View>

              {/* Deposit Button */}
              <TouchableOpacity
                className={`items-center rounded-2xl py-4 ${
                  isDepositValid() ? 'bg-[#FF9C42]' : 'bg-[#FF9C6E]'
                }`}
                onPress={handleDeposit}
                disabled={!isDepositValid()}
                accessibilityLabel="Deposit funds button"
                accessibilityState={{ disabled: !isDepositValid() }}
                accessibilityHint={!isDepositValid() ? 'Minimum $10 required' : undefined}>
                <Text
                  className={`text-base font-semibold ${
                    isDepositValid() ? 'text-white' : 'text-gray-200'
                  }`}>
                  Deposit funds
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Box */}
            <View
              className="flex-row items-start rounded-2xl bg-[#EFF6FF] p-4"
              accessibilityRole="text"
              accessibilityLabel="Important investment information">
              <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-[#3B82F6]">
                <Ionicons name="information" size={14} color="#FFFFFF" />
              </View>
              <Text className="flex-1 text-sm text-[#6B7280]">
                Funds are used to finance BNPL purchases. Returns are not guaranteed.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InvestScreen;
