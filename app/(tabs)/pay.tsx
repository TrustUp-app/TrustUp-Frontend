import { ScrollView } from 'react-native';

import PayScreen from 'components/pages/PayScreen';
import { MainLayout } from 'components/shared/MainLayout';

export default function PayRoute() {
  return (
    <MainLayout>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <PayScreen />
      </ScrollView>
    </MainLayout>
  );
}
