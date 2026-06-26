import { SafeAreaProvider } from 'react-native-safe-area-context';
import PayScreen from 'components/pages/PayScreen';
import { MainLayout } from 'components/shared/MainLayout';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainLayout>
        <PayScreen />
      </MainLayout>
    </SafeAreaProvider>
  );
}
