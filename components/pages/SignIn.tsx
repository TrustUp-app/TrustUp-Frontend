import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { User, Lock, Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react-native';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  // Derived validation — computed every render, no stale state possible
  const isValid = username.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = () => {
    if (!isValid) return;
    console.log('Form Data:', { username, password });
    Alert.alert('Sign In', `Username: ${username}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]">
      {/* contentContainerStyle does not support className in NativeWind */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
        }}>
        {/* Logo Section */}
        <View className="mb-10 items-center">
          <View
            className="mb-4 h-[100px] w-[100px] items-center justify-center rounded-3xl bg-white shadow-md"
            style={Platform.select({ android: { elevation: 5 } })}>
            {/* Image requires numeric dimensions; resizeMode set via prop */}
            <Image
              source={require('../../assets/trustUpLogo.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-[32px] font-extrabold text-[#1e293b]">Trust Up</Text>
          <Text className="mt-1 text-sm text-[#64748b]">
            Build your reputation, unlock your credit
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mt-2.5 w-full">
          <Text className="mb-2 ml-1 text-xs font-bold text-[#94a3b8]">Username</Text>
          <View className="mb-4 flex-row items-center rounded-2xl border border-[#f1f5f9] bg-white px-4 py-4">
            <User stroke="#94a3b8" size={20} />
            <TextInput
              className="ml-2 flex-1 text-base text-[#1e293b]"
              placeholder="@josue_crypto"
              placeholderTextColor="#cbd5e1"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text className="mb-2 ml-1 text-xs font-bold text-[#94a3b8]">Password</Text>
          <View className="mb-4 flex-row items-center rounded-2xl border border-[#f1f5f9] bg-white px-4 py-4">
            <Lock stroke="#94a3b8" size={20} />
            <TextInput
              className="ml-2 flex-1 text-base text-[#1e293b]"
              placeholder="••••••••"
              placeholderTextColor="#cbd5e1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <Pressable
              onPress={() => setSecureText((prev) => !prev)}
              accessibilityLabel={secureText ? 'Show password' : 'Hide password'}
              hitSlop={12}
              style={{ padding: 8 }}>
              {secureText ? (
                <Eye stroke="#94a3b8" size={20} />
              ) : (
                <EyeOff stroke="#94a3b8" size={20} />
              )}
            </Pressable>
          </View>

          <TouchableOpacity className="mb-6 self-end" activeOpacity={0.7}>
            <Text className="text-sm font-bold text-signin-link">Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            accessibilityState={{ disabled: !isValid }}
            style={{
              height: 60,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              backgroundColor: isValid ? '#ff9a76' : '#cbd5e1',
              elevation: isValid ? 8 : 0,
            }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginRight: 8 }}>
              Sign In
            </Text>
            <ArrowRight stroke="#fff" size={18} />
          </Pressable>
        </View>

        {/* Divider */}
        <View className="my-8 w-full flex-row items-center">
          <View className="h-px flex-1 bg-[#e2e8f0]" />
          <Text className="mx-4 text-xs font-extrabold text-[#cbd5e1]">OR</Text>
          <View className="h-px flex-1 bg-[#e2e8f0]" />
        </View>

        {/* Connect Wallet */}
        <TouchableOpacity
          className="h-[60px] w-full flex-row items-center justify-center rounded-[20px] border border-wallet-border bg-wallet-bg"
          activeOpacity={0.7}>
          <Wallet stroke="#f59e0b" size={20} />
          <Text className="text-base font-bold text-wallet-border">Connect Wallet</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="mt-8 flex-row">
          <Text className="text-[#64748b]">Don&apos;t have an account? </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="font-bold text-signin-link">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
