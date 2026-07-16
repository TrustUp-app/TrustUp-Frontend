import { useRouter } from 'expo-router';

import CreateAccountScreen from 'components/pages/CreateAccountScreen';

export default function CreateAccountRoute() {
  const router = useRouter();

  return <CreateAccountScreen navigation={{ goBack: () => router.back() }} />;
}
