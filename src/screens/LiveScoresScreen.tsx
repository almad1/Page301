import React, { useEffect, useRef } from 'react';
import {
  View, ScrollView, Text, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { NormalisedMatch } from '../types';
import { isEuropean, competitionPriority } from '../utils/competitions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchLiveMatches, fetchFixtures, setSelectedDate, clearFixturesCache } from '../store/scoresSlice';
import { TeletextHeader } from '../components/TeletextHeader';
import { ScoreRow } from '../components/ScoreRow';
import { TeletextColors, TeletextStyles, TeletextFonts } from '../styles/teletext';

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function groupAndSort(matches: NormalisedMatch[], europeanOnly = false) {
  const filtered = europeanOnly
    ? matches.filter((m) => isEuropean(m.competition_id, m.competition_name))
    : matches;

  // Key by competition_id so leagues with identical names (e.g. many "Premier League"s) stay separate
  const groups: Record<number, { name: string; matches: NormalisedMatch[] }> = {};
  for (const m of filtered) {
    const id = m.competition_id;
    if (!groups[id]) groups[id] = { name: m.competition_name || 'Other', matches: [] };
    groups[id].matches.push(m);
  }
  for (const id of Object.keys(groups)) {
    groups[Number(id)].matches.sort((a, b) => a.scheduled.localeCompare(b.scheduled));
  }
  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => {
      const pa = competitionPriority(a, groups[a].name);
      const pb = competitionPriority(b, groups[b].name);
      if (pa !== pb) return pa - pb;
      return (groups[a].matches[0]?.scheduled ?? '').localeCompare(groups[b].matches[0]?.scheduled ?? '');
    })
    .map((id) => ({ competition: groups[id].name, matches: groups[id].matches }));
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export const LiveScoresScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    liveMatches, fixtures, selectedDate,
    loading, fixturesLoading, lastUpdated,
  } = useSelector((state: RootState) => state.scores);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(fetchLiveMatches());
    dispatch(fetchFixtures(selectedDate));

    pollingIntervalRef.current = setInterval(() => {
      dispatch(fetchLiveMatches());
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [dispatch]);

  // Reload fixtures when date changes
  useEffect(() => {
    dispatch(fetchFixtures(selectedDate));
  }, [dispatch, selectedDate]);

  const handlePrevDay = () => dispatch(setSelectedDate(shiftDate(selectedDate, -1)));
  const handleNextDay = () => dispatch(setSelectedDate(shiftDate(selectedDate, +1)));

  const handleRefresh = () => {
    dispatch(clearFixturesCache());
    dispatch(fetchLiveMatches());
    dispatch(fetchFixtures(selectedDate));
  };

  const hasLive = liveMatches.length > 0;
  const lastUpdatedTime = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '';
  const groupedFixtures = groupAndSort(fixtures, true);
  const groupedLive = groupAndSort(liveMatches, true);

  return (
    <View style={TeletextStyles.container}>
      <TeletextHeader
        title={hasLive ? 'LIVE SCORES' : 'FIXTURES'}
        subtitle={hasLive ? `Live · Updated: ${lastUpdatedTime}` : formatDateLabel(selectedDate)}
      />

      {/* Live banner when games are on */}
      {hasLive && (
        <>
          <ScrollView style={styles.liveSection} showsVerticalScrollIndicator={false}>
            {groupedLive.map(({ competition, matches }) => (
              <View key={competition}>
                <View style={styles.competitionHeader}>
                  <Text style={styles.competitionTitle}>{competition.toUpperCase()}</Text>
                </View>
                {matches.map((m) => <ScoreRow key={m.id} match={m} showCompetition={false} />)}
              </View>
            ))}
          </ScrollView>
          <View style={styles.divider}>
            <Text style={styles.dividerText}>─── FIXTURES ───</Text>
          </View>
        </>
      )}

      {/* Fixtures for selected date */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading || fixturesLoading} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        style={hasLive ? styles.fixturesSection : undefined}
      >
        {fixturesLoading ? (
          <Text style={styles.statusText}>LOADING...</Text>
        ) : groupedFixtures.length > 0 ? (
          groupedFixtures.map(({ competition, matches }) => (
            <View key={competition}>
              <View style={styles.competitionHeader}>
                <Text style={styles.competitionTitle}>{competition.toUpperCase()}</Text>
              </View>
              {matches.map((m) => <ScoreRow key={m.id} match={m} showCompetition={false} />)}
            </View>
          ))
        ) : (
          <Text style={styles.statusText}>No fixtures found</Text>
        )}
      </ScrollView>

      {/* Date navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevDay}>
          <Text style={styles.navText}>◄ PREV</Text>
        </TouchableOpacity>
        <Text style={styles.navDate}>{selectedDate}</Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNextDay}>
          <Text style={styles.navText}>NEXT ►</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>⟳ REFRESH</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  competitionHeader: {
    backgroundColor: TeletextColors.cyan,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginTop: 8,
  },
  competitionTitle: {
    color: TeletextColors.background,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  liveSection: {
    maxHeight: 200,
  },
  fixturesSection: {
    flex: 1,
  },
  divider: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  dividerText: {
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
  },
  statusText: {
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: TeletextFonts.family,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopColor: TeletextColors.cyan,
    borderTopWidth: 1,
    marginTop: 8,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: TeletextColors.cyan,
  },
  navText: {
    color: TeletextColors.background,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    fontWeight: 'bold',
  },
  navDate: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  refreshButton: {
    backgroundColor: TeletextColors.orange,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: TeletextColors.background,
    fontWeight: 'bold',
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
});
