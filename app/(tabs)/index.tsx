import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../components/shared/MainLayout';

export default function HomeTab() {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    router.replace('/sign-in');
  }, [router]);

  return <MainLayout onSignOut={handleSignOut} />;
}
