import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import InvestScreen from 'components/pages/InvestScreen';
import SignInScreen from 'components/pages/SignIn';
import { MainLayout } from 'components/shared/MainLayout';
import { getToken } from 'lib/auth-storage';
import './global.css';

type Session = 'loading' | 'in' | 'out';

const colors = require('./theme/colors.json');

export default function App() {
  const [session, setSession] = useState<Session>('loading');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setSession(token ? 'in' : 'out');
    })();
  }, []);

  const handleSignInSuccess = useCallback(() => setSession('in'), []);
  const handleSignOut = useCallback(() => setSession('out'), []);

  return (
    <SafeAreaProvider>
      {session === 'loading' ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
          }}>
          <ActivityIndicator size="large" color={colors.cta} />
        </View>
      ) : session === 'out' ? (
        <SignInScreen onSignInSuccess={handleSignInSuccess} />
      ) : (
        <MainLayout onSignOut={handleSignOut}>
          <InvestScreen />
        </MainLayout>
      )}
    </SafeAreaProvider>
  );
}
