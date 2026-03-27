import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainLayout } from 'components/shared/MainLayout';
import InvestScreen from 'components/pages/InvestScreen';
import CreateAccountScreen from 'components/pages/CreateAccountScreen';
import PayScreen from 'components/pages/PayScreen';
import { RootStackParamList } from 'types/Navigation';
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainLayout>
          <Stack.Navigator
            initialRouteName="Invest Screen"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Invest Screen" component={InvestScreen} />
            <Stack.Screen name="Create Account" component={CreateAccountScreen} />
            <Stack.Screen name="Pay Screen" component={PayScreen} />
          </Stack.Navigator>
        </MainLayout>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}