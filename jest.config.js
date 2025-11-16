module.exports = {
  preset: 'react-native',
  setupFiles: [
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|react-native-vector-icons|@react-navigation|react-native-google-mobile-ads|react-native-linear-gradient|react-native-calendars|react-native-sqlite-storage|react-native-currency-input|d3-[^/]+)/)',
  ],
};
