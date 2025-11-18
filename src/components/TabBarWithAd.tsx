import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { AdBanner } from './AdBanner';

interface TabBarWithAdProps {
  children: React.ReactNode;
}

export function TabBarWithAd({ children }: TabBarWithAdProps) {
  return (
    <View style={styles.container}>
      {children}
      <View style={styles.adContainer}>
        <AdBanner placement="bottom-fixed" isFixed={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 138 : 118,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    zIndex: 1000,
  },
});
