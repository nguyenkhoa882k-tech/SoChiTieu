import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useThemePalette } from '@/theme/ThemeProvider';

const IOS_TEST_ID = 'ca-app-pub-3940256099942544/2934735716';
const ANDROID_TEST_ID = 'ca-app-pub-3940256099942544/6300978111';

interface AdBannerProps {
  placement?: string;
}

export function AdBanner({ placement = 'overview' }: AdBannerProps) {
  const { palette } = useThemePalette();
  const adUnitId = Platform.select({
    ios: IOS_TEST_ID,
    android: ANDROID_TEST_ID,
    default: TestIds.BANNER,
  });

  return (
    <View style={[styles.container, { borderColor: palette.border }]}
      accessibilityLabel={`Ad banner ${placement}`}>
      <BannerAd unitId={adUnitId!} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      <Text style={[styles.helper, { color: palette.muted }]}>
        * Test Ad ({placement})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  helper: {
    fontSize: 10,
    marginTop: 4,
  },
});
