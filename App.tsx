import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import { store } from './src/store';
import { LiveScoresScreen } from './src/screens/LiveScoresScreen';
import { TeletextColors } from './src/styles/teletext';

export default function App() {
  const [fontsLoaded] = useFonts({
    CourierPrime_700Bold: require('./assets/fonts/CourierPrime_700Bold.ttf'),
  });

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
        <StatusBar style="light" />
        <LiveScoresScreen />
      </Provider>
    </SafeAreaProvider>
  );
}
