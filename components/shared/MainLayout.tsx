import { View, ScrollView, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'

import { ReactNode, useState } from 'react';

import { BottomBar } from './BottomBar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <View style={styles.container}>
          <Header />
          <ScrollView
            contentContainerStyle={styles.content}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
        <View style={styles.bottomBarContainer}>
          <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const BOTTOM_BAR_HEIGHT = 60;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: BOTTOM_BAR_HEIGHT,
  },
  content: {
    flexGrow: 1,
  },
bottomBarContainer: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: BOTTOM_BAR_HEIGHT,
  backgroundColor: 'transparent',
  zIndex: 10,
},
});

