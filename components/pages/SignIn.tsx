import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { User, Lock, Eye, EyeOff, Wallet, ArrowRight } from 'lucide-react-native';
import { useSignIn } from '../../hooks/auth/use-sign-in';
// Centralized color palette shared with Tailwind
const colors = require('../../theme/colors.json');

export default function SignInScreen() {
  const {
    formState,
    isValid,
    handleUsernameChange,
    handlePasswordChange,
    toggleSecureText,
    handleSignIn,
  } = useSignIn();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View className="mb-10 items-center">
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/trustUpLogo.png')} style={styles.logo} />
          </View>
          <Text style={styles.title}>Trust Up</Text>
          <Text style={styles.tagline}>Build your reputation, unlock your credit</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <User stroke={colors.label} size={20} />
            <TextInput
              style={styles.input}
              placeholder="@josue_crypto"
              placeholderTextColor={colors.placeholderMuted}
              value={formState.username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke={colors.label} size={20} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholderMuted}
              value={formState.password}
              onChangeText={handlePasswordChange}
              secureTextEntry={formState.secureText}
            />
            <TouchableOpacity onPress={toggleSecureText}>
              {formState.secureText ? (
                <Eye stroke={colors.label} size={20} />
              ) : (
                <EyeOff stroke={colors.label} size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, !isValid && styles.disabledBtn]}
            disabled={!isValid}
            onPress={handleSignIn}>
            <Text style={styles.signInBtnText}>Sign In</Text>
            <ArrowRight stroke={colors.white} size={18} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        {/* Connect Wallet */}
        <TouchableOpacity style={styles.walletBtn}>
          <Wallet stroke={colors.amber} size={20} />
          <Text style={styles.walletBtnText}>Connect Wallet</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSoft },
  scrollContent: { padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowStrong,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  title: { fontSize: 32, fontWeight: '800', color: colors.heading },
  tagline: { fontSize: 14, color: colors.tagline, marginTop: 4 },
  form: { width: '100%', marginTop: 10 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: colors.heading, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: colors.primaryTint, fontWeight: '700', fontSize: 14 },
  signInBtn: {
    backgroundColor: colors.ctaAlt,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ctaAlt,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledBtn: { backgroundColor: colors.placeholderMuted, shadowOpacity: 0, elevation: 0 },
  signInBtnText: { color: colors.white, fontSize: 18, fontWeight: '700', marginRight: 8 },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    width: '100%',
  },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
  orText: { marginHorizontal: 16, color: colors.placeholderMuted, fontSize: 12, fontWeight: '800' },
  walletBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.walletBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.walletBg,
  },
  walletBtnText: { color: colors.walletBorder, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', marginTop: 32 },
  footerText: { color: colors.tagline },
  signUpText: { color: colors.primaryTint, fontWeight: '700' },
});
