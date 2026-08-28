import { useCallback, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SignInScreen from 'components/pages/SignIn';
import CreateAccountScreen from 'components/pages/CreateAccountScreen';
import { MainLayout } from 'components/shared/MainLayout';
import { AuthProvider, useAuth } from 'context/auth.context';
import './global.css';

const colors = require('./theme/colors.json');

type AuthScreen = 'sign-in' | 'create-account';

function AppContent() {
  const { user, token, isLoading, signOut } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('sign-in');

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size="large" color={colors.cta} />
      </View>
    );
  }

  if (!token || !user) {
    return authScreen === 'sign-in' ? (
      <SignInScreen onNavigateToCreateAccount={() => setAuthScreen('create-account')} />
    ) : (
      <CreateAccountScreen
        onBack={() => setAuthScreen('sign-in')}
        onSuccess={() => setAuthScreen('sign-in')}
      />
    );
  }

  return (
    <MainLayout onSignOut={handleSignOut} />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
