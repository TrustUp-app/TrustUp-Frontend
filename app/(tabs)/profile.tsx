import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import ProfileScreen from '../../components/pages/ProfileScreen';
import { useProfile } from '../../hooks/profile/use-profile';

export default function ProfileTab() {
  const router = useRouter();
  const { profile, isLoading, error, disconnectWallet, refresh } = useProfile();

  // Reload the latest profile whenever the tab regains focus (e.g. after
  // returning from Edit Profile) so edited fields are reflected.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleEditPress = useCallback(() => {
    router.push('/edit-profile');
  }, [router]);

  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
    router.replace('/sign-in');
  }, [router, disconnectWallet]);

  return (
    <ProfileScreen
      profile={profile}
      isLoading={isLoading}
      error={error}
      onBack={() => {}}
      onEditPress={handleEditPress}
      onDisconnect={handleDisconnect}
      hideBack
    />
  );
}
