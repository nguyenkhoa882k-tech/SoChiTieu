import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-google-mobile-ads', () => ({
  BannerAd: () => null,
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
  TestIds: { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' },
  useInterstitialAd: () => ({
    isLoaded: false,
    isClosed: false,
    load: jest.fn(),
    show: jest.fn(),
  }),
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native-sqlite-storage', () => {
  return {
    enablePromise: jest.fn(),
    openDatabase: jest.fn(() =>
      Promise.resolve({
        executeSql: jest.fn(() =>
          Promise.resolve([{ rows: { length: 0, item: () => ({}) } }]),
        ),
      }),
    ),
  };
});

jest.mock('react-native-calendars', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockCalendar = (props: any) => React.createElement(View, props);
  return { Calendar: MockCalendar };
});
