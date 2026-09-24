import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../components/shared/MainLayout';
import { useAuth } from '@/context/auth.context';

export default function PayTab() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/sign-in');
  }, [router, signOut]);

  return <MainLayout onSignOut={handleSignOut} />;
}
