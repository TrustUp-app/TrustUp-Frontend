import { useRouter } from 'expo-router';
import CreateAccountScreen from '../components/pages/CreateAccountScreen';

export default function CreateAccount() {
  const router = useRouter();

  // Mock navigation object for CreateAccountScreen
  const navigation = {
    goBack: () => router.back(),
    navigate: (route: string) => router.push(route as any),
  };

  return <CreateAccountScreen navigation={navigation} />;
}
