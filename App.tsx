import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useThemePalette } from '@/theme/ThemeProvider';
import { TransactionProvider } from '@/context/TransactionContext';
import { MainTabs } from '@/navigation/MainTabs';

function RootNavigation() {
  const { isDark, palette } = useThemePalette();
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

function AppProviders() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TransactionProvider>
            <RootNavigation />
          </TransactionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return <AppProviders />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
