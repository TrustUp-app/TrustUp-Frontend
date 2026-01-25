import React, { useState, useEffect } from 'react';
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

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Form Validation Logic
  useEffect(() => {
    setIsValid(username.trim().length > 0 && password.trim().length > 0);
  }, [username, password]);

  const handleSignIn = () => {
    console.log('Form Data:', { username, password });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Section */}
        <View className="items-center mb-10">
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
            <User stroke="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="@josue_crypto"
              placeholderTextColor="#cbd5e1"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke="#94a3b8" size={20} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#cbd5e1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              {secureText ? <Eye stroke="#94a3b8" size={20} /> : <EyeOff stroke="#94a3b8" size={20} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.signInBtn, !isValid && styles.disabledBtn]}
            disabled={!isValid}
            onPress={handleSignIn}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
            <ArrowRight stroke="#fff" size={18} />
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
          <Wallet stroke="#f59e0b" size={20} />
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 24, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  title: { fontSize: 32, fontWeight: '800', color: '#1e293b' },
  tagline: { fontSize: 14, color: '#64748b', marginTop: 4 },
  form: { width: '100%', marginTop: 10 },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  icon: { marginRight: 12 },
  input: { flex: 1, color: '#1e293b', fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#0ea5e9', fontWeight: '700', fontSize: 14 },
  signInBtn: {
    backgroundColor: '#ff9a76',
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff9a76',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledBtn: { backgroundColor: '#cbd5e1', shadowOpacity: 0, elevation: 0 },
  signInBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 8 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { marginHorizontal: 16, color: '#cbd5e1', fontSize: 12, fontWeight: '800' },
  walletBtn: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FBBF24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFDAB9',
  },
  walletBtnText: { color: '#FBBF24', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', marginTop: 32 },
  footerText: { color: '#64748b' },
  signUpText: { color: '#0ea5e9', fontWeight: '700' },
});