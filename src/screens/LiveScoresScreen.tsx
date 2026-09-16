import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NormalisedMatch } from '../types';
import { KNOWN_IDS, competitionPriority } from '../utils/competitions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchLiveMatches, fetchFixtures, fetchTodayResults, fetchHistoryForDate,
  setSelectedDate, clearFixturesCache, todayStr, prefetchDate,
} from '../store/scoresSlice';
import { TeletextHeader } from '../components/TeletextHeader';
import { ScoreRow } from '../components/ScoreRow';
import { ColorButtons } from '../components/ColorButtons';
import { LeagueTableModal } from '../components/LeagueTableModal';
import { TeletextColors, TeletextStyles, TeletextFonts } from '../styles/teletext';
import { useNav } from '../navigation/NavContext';
import { dateForPage, getLeaguePage } from '../navigation/pages';
import { AdBanner } from '../components/AdBanner';

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
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
      const pa = competitionPriority(a);
      const pb = competitionPriority(b);
      if (pa !== pb) return pa - pb;
      return (groups[a].matches[0]?.scheduled ?? '').localeCompare(
        groups[b].matches[0]?.scheduled ?? ''
      );
    })
    .map((id) => ({ competition: groups[id].name, id, matches: groups[id].matches }));
}

// Unique key per match regardless of which endpoint it came from.
// The fixture and live endpoints use different numeric IDs for the same game,
// so we can't use m.id — use competition + teams instead.
function matchKey(m: NormalisedMatch): string {
  return `${m.competition_id}|${m.home_name.toLowerCase()}|${m.away_name.toLowerCase()}`;
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

  const map = new Map<string, NormalisedMatch>();

  if (isPast) {
    for (const m of fixtures.filter((f) => f.date === selectedDate)) map.set(matchKey(m), m);
    for (const m of (historyCache[selectedDate] || [])) map.set(matchKey(m), m);
  } else {
    for (const m of fixtures.filter((f) => f.date === selectedDate)) map.set(matchKey(m), m);
    if (isToday) {
      // todayResults and liveMatches overwrite fixtures — they have live scores/status
      for (const m of todayResults) map.set(matchKey(m), m);
      for (const m of liveMatches) map.set(matchKey(m), m);
    }
  }

  return Array.from(map.values()).filter((m) => KNOWN_IDS.has(m.competition_id));
}

export const LiveScoresScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPage, navigate } = useNav();
  const {
    liveMatches, fixtures, todayResults, selectedDate,
    historyCache, fixturesLoading, historyLoading,
  } = useSelector((state: RootState) => state.scores);

  const today = todayStr();
  const minDate = shiftDate(today, -10);
  const [tableComp, setTableComp] = useState<{ id: number; name: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Set the selected date whenever we navigate to a score page (301/302/303)
  useEffect(() => {
    if (currentPage >= 301 && currentPage <= 303) {
      dispatch(setSelectedDate(dateForPage(currentPage)));
    }
  }, [currentPage, dispatch]);

  // Live match polling — independent of date
  useEffect(() => {
    dispatch(fetchLiveMatches());
    const poll = setInterval(() => dispatch(fetchLiveMatches()), 60_000);
    return () => clearInterval(poll);
  }, [dispatch]);

  // Date-based fetching — runs whenever selected date changes
  useEffect(() => {
    if (selectedDate < today) {
      dispatch(fetchFixtures(selectedDate));
      dispatch(fetchHistoryForDate(selectedDate));
    } else {
      void (async () => {
        await dispatch(fetchFixtures(selectedDate));
        if (selectedDate === today) dispatch(fetchTodayResults(today));
      })();
    }
  }, [dispatch, selectedDate, today]);

  // Prefetch surrounding dates so navigation feels instant
  useEffect(() => {
    for (let i = 1; i <= 3; i++) {
      dispatch(prefetchDate(shiftDate(selectedDate, i)));
      dispatch(prefetchDate(shiftDate(selectedDate, -i)));
    }
  }, [dispatch, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(clearFixturesCache());
    try {
      if (selectedDate < today) {
        await Promise.all([
          dispatch(fetchLiveMatches()),
          dispatch(fetchHistoryForDate(selectedDate)),
        ]);
      } else {
        await dispatch(fetchLiveMatches());
        await dispatch(fetchFixtures(selectedDate));
        if (selectedDate === today) await dispatch(fetchTodayResults(today));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const combined = buildCombinedMatches(liveMatches, todayResults, fixtures, historyCache, selectedDate);
  const grouped = groupAndSort(combined);
  const isLoading = selectedDate < today ? (historyLoading || fixturesLoading) : fixturesLoading;

  return (
    <View style={[TeletextStyles.container, { paddingTop: insets.top, paddingBottom: 0 }]}>
      <TeletextHeader />

      <Text style={styles.dateLabel}>{formatDateLabel(selectedDate)}</Text>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={TeletextColors.cyan}
            colors={[TeletextColors.cyan]}
          />
        }
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
                onPress={() => {
                  const lp = getLeaguePage(id);
                  if (lp) navigate(lp.page);
                  else setTableComp({ id, name: competition });
                }}
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
          style={[styles.navButton, selectedDate <= minDate && styles.navButtonDisabled]}
          onPress={() => selectedDate > minDate && dispatch(setSelectedDate(shiftDate(selectedDate, -1)))}
        >
          <Text style={styles.navText}>◄ PREV</Text>
        </TouchableOpacity>
        <Text style={styles.navDate}>{selectedDate === today ? 'Today' : selectedDate}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => dispatch(setSelectedDate(shiftDate(selectedDate, 1)))}
        >
          <Text style={styles.navText}>NEXT ►</Text>
        </TouchableOpacity>
      </View>

      <AdBanner />
      <ColorButtons />

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
  scroll: { flex: 1 },
  dateLabel: {
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
    textAlign: 'center',
    paddingHorizontal: 8,
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
  navButtonDisabled: {
    backgroundColor: '#1a4444',
    opacity: 0.5,
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
});
