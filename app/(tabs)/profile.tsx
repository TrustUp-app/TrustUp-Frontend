import { Text, View } from 'react-native';

import { MainLayout } from 'components/shared/MainLayout';

export default function ProfileRoute() {
  return (
    <MainLayout>
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-base font-semibold text-text">Profile — coming soon</Text>
      </View>
    </MainLayout>
  );
}
