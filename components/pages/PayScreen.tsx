import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

const PayScreen = () => {
  return (
    <View className="px-6 pt-6">
      {/*Reputation Score Card*/}
      <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-successBadge">
              <Ionicons name="trophy" size={14} color={colors.successDeep} />
            </View>
            <Text className="font-medium text-textMuted">Reputation Score</Text>
          </View>
          <View className="rounded-full bg-successSoft px-3 py-1">
            <Text className="text-xs font-semibold text-successDeep">Verified</Text>
          </View>
        </View>

        <View className="mb-4 items-center">
          <View className="flex-row items-end">
            <Text className="text-6xl font-bold text-primary">82</Text>
            <Text className="mb-2 text-2xl text-textMuted">/100</Text>
          </View>
        </View>

        <View className="mb-2 h-2 w-full rounded-full bg-gray-200">
          <View className="h-2 w-4/5 rounded-full bg-primary" />
        </View>

        <Text className="text-center text-xs text-textMuted">
          Excellent reputation • Higher score = more credit
        </Text>
      </View>

      {/*Available Credit Card*/}
      <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="mb-2 text-sm text-textMuted">Available Credit</Text>
            <Text className="text-4xl font-bold text-primary">$320.00</Text>
            <Text className="mt-1 text-xs text-textMuted">Based on your reputation</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-amberSoft">
            <Ionicons name="wallet" size={24} color={colors.amber} />
          </View>
        </View>
      </View>

      {/*Amount Due Card*/}
      <View className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="rounded-full bg-successSoft px-3 py-1">
            <Text className="text-xs font-semibold text-successDeep">ACTIVE</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text className="text-xs text-textMuted">3 days left</Text>
          </View>
        </View>

        <Text className="mb-2 text-sm text-textMuted">Amount Due</Text>
        <Text className="mb-1 text-4xl font-bold text-text">$50.00</Text>
        <Text className="mb-4 text-xs text-textMuted">of $150.00</Text>

        <View className="mb-4 h-2 w-full rounded-full bg-gray-200">
          <View className="h-2 w-1/3 rounded-full bg-primary" />
        </View>

        <TouchableOpacity activeOpacity={0.8} className="items-center rounded-xl bg-cta py-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-white">Pay now</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/*Action buttons */}
      <View className="mb-4 flex-row gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-successSoft">
            <Ionicons name="eye-outline" size={24} color={colors.successDeep} />
          </View>
          <Text className="text-center text-sm font-medium text-text">View</Text>
          <Text className="text-center text-sm font-medium text-text">Reputation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-amberSoft">
            <Ionicons name="compass-outline" size={24} color={colors.amber} />
          </View>
          <Text className="text-center text-sm font-medium text-text">Explore</Text>
          <Text className="text-center text-sm font-medium text-text">Merchants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-1 items-center rounded-2xl bg-white p-5 shadow-sm">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-errorSoft">
            <Ionicons name="time-outline" size={24} color={colors.error} />
          </View>
          <Text className="text-center text-sm font-medium text-text">Loan History</Text>
        </TouchableOpacity>
      </View>

      {/* BNPL Card */}
      <View className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-successSoft">
            <Ionicons name="checkmark-circle" size={24} color={colors.successDeep} />
          </View>
          <View className="flex-1">
            <Text className="mb-1 font-semibold text-text">You are eligible for BNPL</Text>
            <Text className="text-xs text-textMuted">
              Start shopping with Buy Now, Pay Later at hundreds of merchants
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PayScreen;
