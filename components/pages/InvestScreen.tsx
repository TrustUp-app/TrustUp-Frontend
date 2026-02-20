import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const InvestScreen = () => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  const formatCurrency = (value: string): string => {
    if (!value || value.trim() === '') {
      return '0.00';
    }

    // Filter out non-numeric characters except decimal point
    let filtered = value.replace(/[^\d.]/g, '');

    // Handle multiple decimal points - keep only the first one
    const decimalCount = (filtered.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = filtered.split('.');
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }

    // Remove leading zeros (except for values < 1)
    if (filtered.startsWith('0') && filtered.length > 1 && filtered[1] !== '.') {
      filtered = filtered.replace(/^0+/, '');
    }

    // Handle case where only decimal point remains after filtering
    if (filtered === '.' || filtered === '') {
      return '0.00';
    }

    // Parse to number and format to 2 decimal places
    const numValue = parseFloat(filtered);
    
    // Handle NaN case
    if (isNaN(numValue)) {
      return '0.00';
    }

    // Format to exactly 2 decimal places
    const formatted = numValue.toFixed(2);

    return formatted;
  };

  // Handle amount input changes
  const handleAmountChange = (text: string): void => {
    // Remove $ sign and spaces if present
    let filtered = text.replace(/[$\s,]/g, '');
    
    // Filter out non-numeric characters except decimal point
    filtered = filtered.replace(/[^\d.]/g, '');

    // Handle multiple decimal points - keep only the first one
    const decimalCount = (filtered.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = filtered.split('.');
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }

    // Remove leading zeros (except for values < 1)
    if (filtered.startsWith('0') && filtered.length > 1 && filtered[1] !== '.') {
      filtered = filtered.replace(/^0+/, '');
    }

    // Handle empty input
    if (filtered === '' || filtered === '.') {
      setDepositAmount('');
      return;
    }

    // Limit to 2 decimal places
    const parts = filtered.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      filtered = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Update state with the raw numeric value (without $ sign)
    setDepositAmount(filtered);
  };

  // Validate deposit amount
  const isDepositValid = (): boolean => {
    // Handle empty input
    if (!depositAmount || depositAmount === '') {
      return false;
    }
    
    // Parse depositAmount to number
    const amount = parseFloat(depositAmount);
    
    // Handle NaN or zero cases
    if (isNaN(amount) || amount === 0) {
      return false;
    }
    
    // Check if amount is >= 10.00
    return amount >= 10.00;
  };

  // Handle deposit button press
  const handleDeposit = (): void => {
    console.log(`Deposit initiated: $${formatCurrency(depositAmount)}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="bg-[#F5F5F5]"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
        <View className="px-6 pt-6 pb-6">
        {/* Page Title */}
        <Text className="text-2xl font-bold text-[#343434] mb-6">
          Invest in TrustUp
        </Text>

        {/* Investment Card */}
        <View 
          className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
          accessibilityRole="summary"
          accessibilityLabel="Your investment summary"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-10 h-10 bg-[#E9D5FF] rounded-full items-center justify-center">
              <Ionicons name="trending-up" size={20} color="#9333EA" />
            </View>
            <Text className="text-[#6B7280] font-medium text-base">Your Investment</Text>
          </View>
          
          {/* Total Invested */}
          <View className="mb-4">
            <Text className="text-[#9CA3AF] text-sm mb-1">Total Invested</Text>
            <Text className="text-5xl font-bold text-[#1F2937]">$1,250.00</Text>
          </View>

          {/* Earnings */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-[#9CA3AF] text-sm">Earnings</Text>
            <Text className="text-base font-semibold text-[#10B981]">+$42.30</Text>
          </View>

          {/* Progress Line */}
          <View className="h-1 bg-[#10B981] mb-4 rounded-full" />

          {/* APY and Return Rate Row */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-[#9CA3AF] text-sm mb-1">Estimated APY</Text>
              <Text className="text-3xl font-bold text-[#1F2937]">5.2%</Text>
            </View>
            <View className="items-end">
              <Text className="text-[#9CA3AF] text-sm mb-1">Return Rate</Text>
              <Text className="text-base font-semibold text-[#10B981]">+3.4%</Text>
            </View>
          </View>
        </View>
        
        {/* Fund Overview Card */}
        <View 
          className="bg-white rounded-2xl p-6 mb-4 shadow-sm"
          accessibilityRole="summary"
          accessibilityLabel="Fund overview information"
        >
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-10 h-10 bg-[#D1FAE5] rounded-full items-center justify-center">
              <Text className="text-xl font-bold text-[#10B981]">$</Text>
            </View>
            <Text className="text-[#6B7280] font-medium text-base">Fund Overview</Text>
          </View>

          {/* Pool Size */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9CA3AF] text-sm">Pool Size</Text>
            <Text className="text-[#1F2937] font-semibold text-base">$48,320</Text>
          </View>

          {/* Active Loans */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9CA3AF] text-sm">Active Loans</Text>
            <Text className="text-[#1F2937] font-semibold text-base">36</Text>
          </View>

          {/* Risk Level */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-[#9CA3AF] text-sm">Risk Level</Text>
            <View className="bg-[#D1FAE5] px-3 py-1 rounded-full">
              <Text className="text-[#10B981] text-xs font-semibold">Low</Text>
            </View>
          </View>

          {/* Disclaimer Text */}
          <Text className="text-[#9CA3AF] text-xs mt-1">
            Returns depend on borrower behavior
          </Text>
        </View>
        
        {/* Deposit Card */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-[#1F2937] mb-4">
            Deposit Funds
          </Text>
          
          {/* Amount Input Field */}
          <View className="mb-4">
            <Text className="text-[#9CA3AF] text-sm mb-2">
              Amount to invest
            </Text>
            <TextInput
              className="text-5xl font-bold text-[#1F2937] mb-2"
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
            <Text className="text-[#9CA3AF] text-xs">
              Minimum deposit $10
            </Text>
          </View>
          
          {/* Deposit Button */}
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center ${
              isDepositValid() ? 'bg-[#FF9C42]' : 'bg-[#FF9C6E]'
            }`}
            onPress={handleDeposit}
            disabled={!isDepositValid()}
            accessibilityLabel="Deposit funds button"
            accessibilityState={{ disabled: !isDepositValid() }}
            accessibilityHint={!isDepositValid() ? "Minimum $10 required" : undefined}
          >
            <Text className={`font-semibold text-base ${
              isDepositValid() ? 'text-white' : 'text-gray-200'
            }`}>
              Deposit funds
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Info Box */}
        <View 
          className="bg-[#EFF6FF] rounded-2xl p-4 flex-row items-start"
          accessibilityRole="text"
          accessibilityLabel="Important investment information"
        >
          <View className="w-6 h-6 bg-[#3B82F6] rounded-full items-center justify-center mr-3 mt-0.5">
            <Ionicons name="information" size={14} color="#FFFFFF" />
          </View>
          <Text className="text-[#6B7280] text-sm flex-1">
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
