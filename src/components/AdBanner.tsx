import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useThemeStore } from '@/stores/themeStore';

const IOS_TEST_ID = 'ca-app-pub-3940256099942544/2934735716';
const ANDROID_TEST_ID = 'ca-app-pub-3940256099942544/6300978111';

interface AdBannerProps {
  placement?: string;
}

export function AdBanner({ placement = 'overview' }: AdBannerProps) {
  const palette = useThemeStore(state => state.palette);
  const adUnitId = Platform.select({
    ios: IOS_TEST_ID,
    android: ANDROID_TEST_ID,
    default: TestIds.BANNER,
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
      accessibilityLabel={`Ad banner ${placement}`}
    >
      <BannerAd
        unitId={adUnitId!}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
