import React, { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { StatusBar, StyleSheet, LogBox } from 'react-native';

// Suppress InteractionManager deprecation warning from @react-navigation/stack
LogBox.ignoreLogs(['InteractionManager has been deprecated']);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '@/stores/themeStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useReminderStore } from '@/stores/reminderStore';
import { MainTabs } from '@/navigation/MainTabs';
import { seedDemoDataIfNeeded } from '@/data/database';
import { initializeNotifications } from '@/services/notificationService';

function RootNavigation() {
  const { isDark, palette, initTheme } = useThemeStore();
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const initReminder = useReminderStore(state => state.initReminder);

  useEffect(() => {
    const init = async () => {
      await initTheme();
      await seedDemoDataIfNeeded();
      await loadTransactions();

      // Initialize notifications
      initializeNotifications();
      await initReminder();
    };
    init();
  }, [initTheme, loadTransactions, initReminder]);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
    },
  };

  return (
    <>
      <StatusBar
        backgroundColor={palette.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer theme={navigationTheme}>
        <MainTabs />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <RootNavigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
