import { useRouter } from 'expo-router';
import CreateAccountScreen from '../components/pages/CreateAccountScreen';

export default function CreateAccount() {
  const router = useRouter();

  return (
    <CreateAccountScreen
      onBack={() => router.back()}
      onSuccess={() => router.replace('/(tabs)')}
    />
  );
}
