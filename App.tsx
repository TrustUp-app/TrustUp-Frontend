import { SafeAreaProvider } from 'react-native-safe-area-context';
import InvestScreen from 'components/pages/InvestScreen';
import { MainLayout } from 'components/shared/MainLayout';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainLayout>
        <InvestScreen />
      </MainLayout>
    </SafeAreaProvider>
  );
}
