import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BANNER_AD_UNIT_ID } from '../utils/ads';

export const AdBanner: React.FC = () => {
  const [AdComponent, setAdComponent] = useState<React.ComponentType<object> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import — silently skipped if native module isn't present (Expo Go)
    import('react-native-google-mobile-ads')
      .then(({ BannerAd, BannerAdSize }) => {
        const Banner = () => (
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            onAdLoaded={() => setLoaded(true)}
            onAdFailedToLoad={() => setLoaded(false)}
          />
        );
        setAdComponent(() => Banner);
      })
      .catch(() => { /* native module not available */ });
  }, []);

  if (!AdComponent) return null;

  return (
    <View style={[styles.container, !loaded && styles.hidden]}>
      <AdComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#000',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
