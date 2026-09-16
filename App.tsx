import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import { store } from './src/store';
import { NavProvider, useNav } from './src/navigation/NavContext';
import { LEAGUE_PAGES } from './src/navigation/pages';
import { LandingScreen } from './src/screens/LandingScreen';
import { LiveScoresScreen } from './src/screens/LiveScoresScreen';
import { LeagueTableScreen } from './src/screens/LeagueTableScreen';
import { TeletextColors } from './src/styles/teletext';
import { initialiseAds } from './src/utils/ads';

function AppRouter() {
  const { currentPage } = useNav();

  if (currentPage >= 301 && currentPage <= 303) return <LiveScoresScreen />;

  const leaguePage = LEAGUE_PAGES.find(p => p.page === currentPage);
  if (leaguePage) {
    return (
      <LeagueTableScreen
        competitionId={leaguePage.competitionId}
        competitionName={leaguePage.name}
      />
    );
  }

  return <LandingScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    MODE7GX3: require('./assets/fonts/MODE7GX3.ttf'),
  });

  useEffect(() => {
    initialiseAds();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: TeletextColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: TeletextColors.textPrimary, fontFamily: 'monospace', fontSize: 14 }}>
          LOADING...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavProvider>
          <StatusBar style="light" />
          <AppRouter />
        </NavProvider>
      </Provider>
    </SafeAreaProvider>
  );
}
