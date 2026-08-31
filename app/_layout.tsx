import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/auth.context';
import '../global.css';

const colors = require('../theme/colors.json');

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === '(auth)' || segments[0] === 'sign-in' || segments[0] === 'create-account';

    if (!token && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace('/sign-in');
    } else if (token && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading, router]);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}>
          <ActivityIndicator size="large" color={colors.cta} />
        </View>
      </SafeAreaProvider>
    );
  }

export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><Gate /></AuthProvider></SafeAreaProvider>;
}
