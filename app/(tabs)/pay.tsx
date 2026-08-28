import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import PayScreen from '../../components/pages/pay/PayScreen';
import { MainLayout } from '../../components/shared/MainLayout';

export default function PayTab() {
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    router.replace('/sign-in');
  }, [router]);

  return (
    <MainLayout onSignOut={handleSignOut}>
      <PayScreen />
    </MainLayout>
  );
}
