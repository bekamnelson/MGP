/* global jest */
// Modules natifs remplacés par des simulations pendant les tests

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);

jest.mock('expo-navigation-bar', () => ({
  setVisibilityAsync: jest.fn(() => Promise.resolve()),
  setBehaviorAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: () => ({ initialize: jest.fn(() => Promise.resolve([])) }),
  AdsConsent: {
    gatherConsent: jest.fn(() => Promise.resolve({ canRequestAds: false })),
    getConsentInfo: jest.fn(() => Promise.resolve({ canRequestAds: false })),
  },
  AppOpenAd: { createForAdRequest: jest.fn() },
  AdEventType: {},
  BannerAd: () => null,
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
  TestIds: { BANNER: 'test-banner', APP_OPEN: 'test-app-open' },
}));
