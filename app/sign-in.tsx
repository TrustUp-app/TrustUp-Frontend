import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import SignInScreen from '../components/pages/SignIn';

export default function SignIn() {
  const router = useRouter();

  const handleSignInSuccess = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return <SignInScreen onSignInSuccess={handleSignInSuccess} />;
}
