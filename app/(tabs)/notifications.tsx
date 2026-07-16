import { useRouter } from 'expo-router';

import { NotificationsPanel } from 'components/shared/NotificationsPanel';

export default function NotificationsRoute() {
  const router = useRouter();

  return <NotificationsPanel isOpen onClose={() => router.back()} presentation="screen" />;
}
