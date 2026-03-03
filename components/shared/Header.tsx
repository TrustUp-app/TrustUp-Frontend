import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/Navigation';

type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

export const Header = () => {
  const navigation = useNavigation<HeaderNavigationProp>();

  return (
    <View className="bg-white px-6 pb-4 pt-12">
      <View className="flex-row items-center justify-between">
        {/* Greetings */}
        <Text className="text-xl font-semibold text-text">Good evening, Josué</Text>

        {/* Right icon */}
        <View className="flex-row items-center gap-4">
          {/* Settings icon */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            accessibilityLabel="Open settings">
            <Ionicons name="settings-outline" size={24} color="#343434" />
          </TouchableOpacity>

          {/* Notifications icon */}
          <TouchableOpacity activeOpacity={0.7} className="h-10 w-10 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity activeOpacity={0.7}>
            <View className="h-10 w-10 overflow-hidden rounded-full bg-gray-300">
              <Image source={{ uri: 'https://via.placeholder.com/40' }} className="h-full w-full" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
