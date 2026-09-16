import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { TeletextFonts } from '../styles/teletext';
import { useNav } from '../navigation/NavContext';
import { AppDispatch } from '../store';
import { setSelectedDate, todayStr } from '../store/scoresSlice';

const DONATE_URL = 'https://buymeacoffee.com/allen175';

export const ColorButtons: React.FC = () => {
  const { navigate } = useNav();
  const dispatch = useDispatch<AppDispatch>();
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingBottom: bottom || 8 }]}>
      <TouchableOpacity style={styles.btn} onPress={() => navigate(300)}>
        <Text style={[styles.label, styles.red]}>HOME</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => { navigate(301); dispatch(setSelectedDate(todayStr())); }}>
        <Text style={[styles.label, styles.green]}>TODAY</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigate(303)}>
        <Text style={[styles.label, styles.yellow]}>TMRW</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => void Linking.openURL(DONATE_URL)}>
        <Text style={[styles.label, styles.blue]}>DONATE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: '#000000' },
  btn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: TeletextFonts.family, fontSize: TeletextFonts.sizes.small },
  red:    { color: '#FF0000' },
  green:  { color: '#00FF00' },
  yellow: { color: '#FFFF00' },
  blue:   { color: '#00FFFF' },
});
