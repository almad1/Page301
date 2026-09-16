import { Platform } from 'react-native';

let initialised = false;

export async function initialiseAds(): Promise<void> {
  if (initialised) return;
  try {
    // iOS 14.5+: request ATT before consent or ads init
    if (Platform.OS === 'ios') {
      const { requestTrackingPermissionsAsync } = await import('expo-tracking-transparency');
      await requestTrackingPermissionsAsync();
    }

    // Dynamic import so the app doesn't crash in Expo Go (native module missing)
    const { default: mobileAds, AdsConsent, AdsConsentStatus } =
      await import('react-native-google-mobile-ads');

    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (
      consentInfo.isConsentFormAvailable &&
      (consentInfo.status === AdsConsentStatus.REQUIRED ||
        consentInfo.status === AdsConsentStatus.UNKNOWN)
    ) {
      await AdsConsent.showForm();
    }

    await mobileAds().initialize();
    initialised = true;
  } catch {
    // Native module not present (Expo Go) or init failed — ads silently disabled
  }
}

export const BANNER_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/6300978111' // Google test banner
  : Platform.OS === 'ios'
    ? 'ca-app-pub-1066434304168352/2902103268'
    : 'ca-app-pub-1066434304168352/3360434112';
