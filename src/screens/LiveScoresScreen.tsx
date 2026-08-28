import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NormalisedMatch } from '../types';
import { isEuropean, competitionPriority } from '../utils/competitions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchLiveMatches, fetchFixtures, fetchTodayResults, fetchRecentHistory,
  setSelectedDate, clearFixturesCache, todayStr,
} from '../store/scoresSlice';
import { TeletextHeader } from '../components/TeletextHeader';
import { ScoreRow } from '../components/ScoreRow';
import { LeagueTableModal } from '../components/LeagueTableModal';
import { TeletextColors, TeletextStyles, TeletextFonts } from '../styles/teletext';

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function currentHHMM(): string {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
}

function groupAndSort(matches: NormalisedMatch[]) {
  const groups: Record<number, { name: string; matches: NormalisedMatch[] }> = {};
  for (const m of matches) {
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
      return (groups[a].matches[0]?.scheduled ?? '').localeCompare(
        groups[b].matches[0]?.scheduled ?? ''
      );
    })
    .map((id) => ({ competition: groups[id].name, id, matches: groups[id].matches }));
}

function buildCombinedMatches(
  liveMatches: NormalisedMatch[],
  todayResults: NormalisedMatch[],
  fixtures: NormalisedMatch[],
  historyCache: Record<string, NormalisedMatch[]>,
  selectedDate: string,
): NormalisedMatch[] {
  const today = todayStr();
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;

  const map = new Map<number, NormalisedMatch>();

  if (isPast) {
    // Past date: show history results (already European-filtered) + any fixtures as fallback
    const pastFixtures = fixtures.filter((f) => f.date === selectedDate);
    for (const m of pastFixtures) map.set(m.id, m);
    for (const m of (historyCache[selectedDate] || [])) map.set(m.id, m);
  } else {
    // Today or future: show upcoming fixtures, then overlay results and live
    const upcomingFixtures = fixtures.filter((f) => {
      if (f.date !== selectedDate) return false;
      if (isToday && f.scheduled && f.scheduled <= currentHHMM()) return false;
      return true;
    });
    for (const m of upcomingFixtures) map.set(m.id, m);
    if (isToday) {
      for (const m of todayResults) map.set(m.id, m);
      for (const m of liveMatches) map.set(m.id, m);
    }
  }

  return Array.from(map.values()).filter((m) =>
    isEuropean(m.competition_id, m.competition_name)
  );
}

export const LiveScoresScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const {
    liveMatches, fixtures, todayResults, selectedDate,
    historyCache, loading, fixturesLoading, resultsLoading, historyLoading,
  } = useSelector((state: RootState) => state.scores);

  const today = todayStr();
  const [tableComp, setTableComp] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    dispatch(fetchLiveMatches());
    dispatch(fetchFixtures(selectedDate));
    dispatch(fetchRecentHistory());
    if (selectedDate === today) dispatch(fetchTodayResults(today));

    const poll = setInterval(() => dispatch(fetchLiveMatches()), 60_000);
    return () => clearInterval(poll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFixtures(selectedDate));
    if (selectedDate === today) dispatch(fetchTodayResults(today));
  }, [dispatch, selectedDate, today]);

  const handleRefresh = () => {
    dispatch(clearFixturesCache());
    dispatch(fetchLiveMatches());
    dispatch(fetchFixtures(selectedDate));
    dispatch(fetchRecentHistory());
    if (selectedDate === today) dispatch(fetchTodayResults(today));
  };

  const combined = buildCombinedMatches(liveMatches, todayResults, fixtures, historyCache, selectedDate);
  const grouped = groupAndSort(combined);
  const isLoading = loading || fixturesLoading || resultsLoading || historyLoading;

  return (
    <View style={[TeletextStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <TeletextHeader />

      {/* Date label */}
      <Text style={styles.dateLabel}>{formatDateLabel(selectedDate)}</Text>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {isLoading && grouped.length === 0 ? (
          <Text style={styles.statusText}>LOADING...</Text>
        ) : grouped.length > 0 ? (
          grouped.map(({ competition, id, matches }) => (
            <View key={id}>
              <TouchableOpacity
                style={styles.competitionHeader}
                onPress={() => setTableComp({ id, name: competition })}
                activeOpacity={0.7}
              >
                <Text style={styles.competitionTitle}>{competition.toUpperCase()}</Text>
                <Text style={styles.competitionArrow}>▶</Text>
              </TouchableOpacity>
              {matches.map((m) => <ScoreRow key={m.id} match={m} />)}
            </View>
          ))
        ) : (
          <Text style={styles.statusText}>No fixtures found</Text>
        )}
      </ScrollView>

      {/* Date navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => dispatch(setSelectedDate(shiftDate(selectedDate, -1)))}
        >
          <Text style={styles.navText}>◄ PREV</Text>
        </TouchableOpacity>
        <Text style={styles.navDate}>{selectedDate === today ? 'Today' : selectedDate}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => dispatch(setSelectedDate(shiftDate(selectedDate, +1)))}
        >
          <Text style={styles.navText}>NEXT ►</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>⟳ REFRESH</Text>
      </TouchableOpacity>

      {tableComp && (
        <LeagueTableModal
          competitionId={tableComp.id}
          competitionName={tableComp.name}
          onClose={() => setTableComp(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  dateLabel: {
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
    textAlign: 'center',
    paddingVertical: 3,
    letterSpacing: 1,
  },
  competitionHeader: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  competitionTitle: {
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    letterSpacing: 1,
  },
  competitionArrow: {
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
    opacity: 0.4,
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
    paddingVertical: 6,
    borderTopColor: TeletextColors.cyan,
    borderTopWidth: 1,
    marginTop: 4,
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: TeletextColors.cyan,
  },
  navText: {
    color: TeletextColors.background,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  navDate: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  refreshButton: {
    backgroundColor: TeletextColors.orange,
    paddingVertical: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: TeletextColors.background,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
});
