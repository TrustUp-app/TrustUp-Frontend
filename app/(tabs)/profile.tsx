import { useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import ProfileScreen from '../../components/pages/ProfileScreen';
import { useAuth } from '../../context/auth.context';
import { useProfile } from '../../hooks/profile/use-profile';

export default function ProfileTab() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, isLoading, error, refresh } = useProfile();

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
    // Clear the stored tokens *and* the auth context so the whole session is
    // reset (not just the local profile), then return to sign-in.
    await signOut();
    router.replace('/sign-in');
  }, [router, signOut]);

  return (
    <ProfileScreen
      profile={profile}
      isLoading={isLoading}
      error={error}
      hideBack
      onBack={() => router.back()}
      onEditPress={handleEditPress}
      onDisconnect={handleDisconnect}
    />
  );
}
