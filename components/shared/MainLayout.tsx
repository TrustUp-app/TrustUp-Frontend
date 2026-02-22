import { View, ScrollView } from 'react-native';

import { ReactNode, useState } from 'react';

import { BottomBar } from './BottomBar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <Header />

      <ScrollView className="flex-1">{children}</ScrollView>

      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}
