import { Redirect } from 'expo-router';

/**
 * Pay Expo tab is hidden (`href: null`). MainLayout (Pay/Invest) lives on the
 * Home tab only — redirect any direct /pay navigation there to avoid a second mount.
 */
export default function PayTab() {
  return <Redirect href="/" />;
}
