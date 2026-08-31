import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import EditProfileScreen from '../components/pages/EditProfileScreen';
import { useProfile } from '../hooks/profile/use-profile';

export default function EditProfileRoute() {
  const router = useRouter();
  const { profile, saveProfile } = useProfile();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [router]);

  return (
    <EditProfileScreen
      profile={profile}
      onBack={handleBack}
      onSave={async (changes) => {
        await saveProfile(changes);
      }}
    />
  );
}
