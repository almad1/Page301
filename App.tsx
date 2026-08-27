import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { store } from './src/store';
import { LiveScoresScreen } from './src/screens/LiveScoresScreen';
import { TeletextColors } from './src/styles/teletext';

export default function App() {
  const [fontsLoaded] = useFonts({ VT323_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: TeletextColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: TeletextColors.textPrimary, fontFamily: 'Courier New', fontSize: 14 }}>
          LOADING...
        </Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <LiveScoresScreen />
    </Provider>
  );
}
