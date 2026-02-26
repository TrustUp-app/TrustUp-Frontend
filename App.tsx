import { SafeAreaProvider } from 'react-native-safe-area-context';
import InvestScreen from 'components/pages/InvestScreen';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <InvestScreen />
    </SafeAreaProvider>
  );
}
