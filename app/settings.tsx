import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import SettingsScreen from '../components/pages/SettingsScreen';
import { useAuth } from '@/context/auth.context';

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/sign-in');
  }, [router, signOut]);

  return (
    <SettingsScreen
      onBack={() => router.back()}
      onProfilePress={() => router.push('/(tabs)/profile')}
      onSignOut={() => void handleSignOut()}
    />
  );
}
