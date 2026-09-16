import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import {
  fetchLiveMatches, fetchFixtures, fetchTodayResults, todayStr,
} from '../store/scoresSlice';
import { TeletextHeader } from '../components/TeletextHeader';
import { ColorButtons } from '../components/ColorButtons';
import { useNav } from '../navigation/NavContext';
import { LEAGUE_PAGES, dateForPage } from '../navigation/pages';
import { TeletextColors, TeletextFonts, TeletextStyles } from '../styles/teletext';

const SCORE_ENTRIES = [
  { page: 301, label: "TODAY'S SCORES" },
  { page: 302, label: "YESTERDAY'S RESULTS" },
  { page: 303, label: "TOMORROW'S FIXTURES" },
];

export const LandingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { navigate } = useNav();

  useEffect(() => {
    const today = todayStr();
    const tomorrow = dateForPage(303);
    // Preload live + today + tomorrow only — history is fetched on demand when user navigates
    dispatch(fetchLiveMatches());
    dispatch(fetchFixtures(tomorrow));
    void (async () => {
      await dispatch(fetchFixtures(today));
      dispatch(fetchTodayResults(today));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[TeletextStyles.container, { paddingTop: insets.top, paddingBottom: 0 }]}>
      <TeletextHeader />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FOOTBALL SCORES</Text>
        </View>
        {SCORE_ENTRIES.map(({ page, label }) => (
          <TouchableOpacity key={page} style={styles.row} onPress={() => navigate(page)}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowPage}>P{page}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.sectionHeader, styles.sectionGap]}>
          <Text style={styles.sectionTitle}>LEAGUE TABLES</Text>
        </View>
        {LEAGUE_PAGES.map(({ page, name }) => (
          <TouchableOpacity key={page} style={styles.row} onPress={() => navigate(page)}>
            <Text style={styles.rowLabel}>{name.toUpperCase()}</Text>
            <Text style={styles.rowPage}>P{page}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 12 }} />
      </ScrollView>
      <ColorButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  sectionHeader: {
    backgroundColor: TeletextColors.blue,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  sectionGap: { marginTop: 12 },
  sectionTitle: {
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  rowLabel: {
    flex: 1,
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  rowPage: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
});
