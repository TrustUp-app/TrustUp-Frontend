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
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollViewRef}
          className="bg-background"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-6 pt-6">
            {/* Page Title */}
            <Text className="mb-6 text-2xl font-bold text-text">Invest in TrustUp</Text>

            {/* Investment Card */}
            <View
              className="mb-4 rounded-2xl bg-white p-6 shadow-sm"
              accessibilityRole="summary"
              accessibilityLabel="Your investment summary">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-purpleSoft">
                  <Ionicons name="trending-up" size={20} color={colors.purple} />
                </View>
                <Text className="text-base font-medium text-textSecondary">Your Investment</Text>
              </View>

              {/* Total Invested */}
              <View className="mb-4">
                <Text className="mb-1 text-sm text-textSubtle">Total Invested</Text>
                <Text className="text-5xl font-bold text-textStrong">$1,250.00</Text>
              </View>

              {/* Earnings */}
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-textSubtle">Earnings</Text>
                <Text className="text-base font-semibold text-success">+$42.30</Text>
              </View>

              {/* Progress Line */}
              <View className="mb-4 h-1 rounded-full bg-success" />

              {/* APY and Return Rate Row */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-sm text-textSubtle">Estimated APY</Text>
                  <Text className="text-3xl font-bold text-textStrong">5.2%</Text>
                </View>
                <View className="items-end">
                  <Text className="mb-1 text-sm text-textSubtle">Return Rate</Text>
                  <Text className="text-base font-semibold text-success">+3.4%</Text>
                </View>
              </View>
            </View>

            {/* Fund Overview Card */}
            <View
              className="mb-4 rounded-2xl bg-white p-6 shadow-sm"
              accessibilityRole="summary"
              accessibilityLabel="Fund overview information">
              <View className="mb-4 flex-row items-center gap-2">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-successSoft">
                  <Text className="text-xl font-bold text-success">$</Text>
                </View>
                <Text className="text-base font-medium text-textSecondary">Fund Overview</Text>
              </View>

              {/* Pool Size */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-textSubtle">Pool Size</Text>
                <Text className="text-base font-semibold text-textStrong">$48,320</Text>
              </View>

              {/* Active Loans */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-textSubtle">Active Loans</Text>
                <Text className="text-base font-semibold text-textStrong">36</Text>
              </View>

              {/* Risk Level */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm text-textSubtle">Risk Level</Text>
                <View className="rounded-full bg-successSoft px-3 py-1">
                  <Text className="text-xs font-semibold text-success">Low</Text>
                </View>
              </View>

              {/* Disclaimer Text */}
              <Text className="mt-1 text-xs text-textSubtle">
                Returns depend on borrower behavior
              </Text>
            </View>

            {/* Deposit Card */}
            <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
              <Text className="mb-4 text-xl font-bold text-textStrong">Deposit Funds</Text>

              {/* Amount Input Field */}
              <View className="mb-4">
                <Text className="mb-2 text-sm text-textSubtle">Amount to invest</Text>
                <TextInput
                  className="mb-2 text-5xl font-bold text-textStrong"
                  keyboardType="numeric"
                  value={depositAmount ? `$${depositAmount}` : ''}
                  onChangeText={handleAmountChange}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 600, animated: true });
                    }, 150);
                  }}
                  placeholder="$0.00"
                  placeholderTextColor={colors.placeholderAlt}
                  accessibilityLabel="Amount to invest input field"
                  accessibilityHint="Enter the amount you want to invest, minimum $10"
                />
                <Text className="text-xs text-textSubtle">Minimum deposit $10</Text>
              </View>

              {/* Deposit Button */}
              <TouchableOpacity
                className={`items-center rounded-2xl py-4 ${
                  isDepositValid() ? 'bg-ctaStrong' : 'bg-cta'
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
              className="flex-row items-start rounded-2xl bg-infoSoft p-4"
              accessibilityRole="text"
              accessibilityLabel="Important investment information">
              <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-info">
                <Ionicons name="information" size={14} color={colors.white} />
              </View>
              <Text className="flex-1 text-sm text-textSecondary">
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
