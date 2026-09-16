import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { liveScoreAPI } from '../api/footballDataClient';
import { NormalisedMatch } from '../types';
import { KNOWN_IDS } from '../utils/competitions';

// Competitions whose scorers must load before anything else
const PRIORITY_IDS = new Set([2, 244, 245, 350]); // PL, UCL, Europa League, Nations League

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const fetchLiveMatches = createAsyncThunk(
  'scores/fetchLiveMatches',
  async () => liveScoreAPI.getLiveMatches(),
);

export const fetchTodayResults = createAsyncThunk(
  'scores/fetchTodayResults',
  async (date: string) => {
    // 4 pages to handle busy fixture days (Bank Holidays, European matchdays)
    const byDate = await liveScoreAPI.getRecentHistory(4);
    const todayMatches = byDate[date] || [];
    return todayMatches.filter((m) => KNOWN_IDS.has(m.competition_id));
  }
);

export const fetchHistoryForDate = createAsyncThunk(
  'scores/fetchHistoryForDate',
  async (date: string, { getState, dispatch }) => {
    const state = getState() as { scores: ScoresState };
    if (state.scores.historyCache[date]) return { date, matches: null };

    // Primary: daily KV accumulated from live endpoint (has all competitions)
    // Fallback: history endpoint (limited to a few competitions)
    const daily = await liveScoreAPI.getDailyResults(date);
    const fromHistory = daily.length === 0 ? await liveScoreAPI.getHistoryForDate(date) : [];
    const european = [...daily, ...fromHistory].filter((m) => KNOWN_IDS.has(m.competition_id));

    // Phase 1: show matches immediately, no scorers yet
    dispatch(setHistoryCacheEntry({ date, matches: european }));

    // Phase 2a: priority competitions first (PL, UCL, Europa League, Nations League)
    const priority = european.filter((m) => PRIORITY_IDS.has(m.competition_id));
    const others   = european.filter((m) => !PRIORITY_IDS.has(m.competition_id));

    const priorityEnriched = priority.length > 0
      ? await liveScoreAPI.batchEnrichWithEvents(priority, 5)
      : [];

    // Update store so priority scorers appear before the rest load
    if (priorityEnriched.length > 0) {
      dispatch(setHistoryCacheEntry({
        date,
        matches: european.map((m) => priorityEnriched.find((p) => p.id === m.id) ?? m),
      }));
    }

    // Phase 2b: remaining competitions (lower concurrency, non-blocking to the user)
    const othersEnriched = others.length > 0
      ? await liveScoreAPI.batchEnrichWithEvents(others, 3)
      : [];

    const allEnriched = [...priorityEnriched, ...othersEnriched];

    // Phase 3: retry any non-zero-score match with no scorers — fire and forget
    const needsRetry = allEnriched.filter((m) => {
      if (!m.score) return false;
      const parts = m.score.replace(/\s/g, '').split('-');
      const total = parts.reduce((sum, p) => sum + (parseInt(p, 10) || 0), 0);
      return total > 0 && (!m.goals || m.goals.length === 0);
    });
    if (needsRetry.length > 0) {
      liveScoreAPI.batchEnrichWithEvents(needsRetry, 2).then((retried) => {
        const updated = [...allEnriched];
        for (const m of retried) {
          if (m.goals && m.goals.length > 0) {
            const idx = updated.findIndex((u) => u.id === m.id);
            if (idx >= 0) updated[idx] = m;
          }
        }
        dispatch(setHistoryCacheEntry({ date, matches: updated }));
      }).catch(() => {});
    }

    return { date, matches: allEnriched };
  }
);

// Lightweight background prefetch — populates caches without affecting loading flags.
// Used to warm adjacent dates so navigation feels instant.
export const prefetchDate = createAsyncThunk(
  'scores/prefetchDate',
  async (date: string, { getState, dispatch }) => {
    const state = getState() as { scores: ScoresState };
    const today = todayStr();
    if (date >= today) {
      if (!state.scores.fixturesCache[date]) dispatch(fetchFixtures(date));
    } else {
      if (!state.scores.historyCache[date]) {
        try {
          const daily = await liveScoreAPI.getDailyResults(date);
          if (daily.length > 0) {
            dispatch(setHistoryCacheEntry({
              date,
              matches: daily.filter((m) => KNOWN_IDS.has(m.competition_id)),
            }));
          }
        } catch { /* prefetch failures are non-critical */ }
      }
    }
  }
);

export const fetchFixtures = createAsyncThunk(
  'scores/fetchFixtures',
  async (date: string, { getState }) => {
    const state = getState() as { scores: ScoresState };
    if (state.scores.fixturesCache[date]) {
      return { date, fixtures: state.scores.fixturesCache[date], cached: true };
    }
    const fixtures = await liveScoreAPI.getFixtures(date);
    return { date, fixtures, cached: false };
  }
);

interface ScoresState {
  liveMatches: NormalisedMatch[];
  fixtures: NormalisedMatch[];
  todayResults: NormalisedMatch[];
  fixturesCache: Record<string, NormalisedMatch[]>;
  historyCache: Record<string, NormalisedMatch[]>;
  historyLoading: boolean;
  selectedDate: string;
  loading: boolean;
  fixturesLoading: boolean;
  resultsLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: ScoresState = {
  liveMatches: [],
  fixtures: [],
  todayResults: [],
  fixturesCache: {},
  historyCache: {},
  historyLoading: false,
  selectedDate: todayStr(),
  loading: false,
  fixturesLoading: false,
  resultsLoading: false,
  error: null,
  lastUpdated: null,
};

const scoresSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setHistoryCacheEntry: (state, action: PayloadAction<{ date: string; matches: NormalisedMatch[] }>) => {
      state.historyCache[action.payload.date] = action.payload.matches;
    },
    clearFixturesCache: (state) => {
      state.fixturesCache = {};
      state.todayResults = [];
      state.historyCache = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveMatches.fulfilled, (state, action) => {
        state.liveMatches = action.payload;
        state.lastUpdated = Date.now();
        state.loading = false;
      })
      .addCase(fetchLiveMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch matches';
      })
      .addCase(fetchTodayResults.pending, (state) => {
        state.resultsLoading = true;
      })
      .addCase(fetchTodayResults.fulfilled, (state, action) => {
        state.todayResults = action.payload;
        state.resultsLoading = false;
      })
      .addCase(fetchTodayResults.rejected, (state) => {
        state.resultsLoading = false;
      })
      .addCase(fetchFixtures.pending, (state) => {
        state.fixturesLoading = true;
      })
      .addCase(fetchFixtures.fulfilled, (state, action) => {
        const { date, fixtures } = action.payload;
        state.fixtures = fixtures;
        state.fixturesCache[date] = fixtures;
        state.fixturesLoading = false;
      })
      .addCase(fetchFixtures.rejected, (state) => {
        state.fixturesLoading = false;
      })
      .addCase(fetchHistoryForDate.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchHistoryForDate.fulfilled, (state, action) => {
        const { date, matches } = action.payload;
        if (matches) state.historyCache[date] = matches;
        state.historyLoading = false;
      })
      .addCase(fetchHistoryForDate.rejected, (state) => {
        state.historyLoading = false;
      });
  },
});

export const { clearError, setSelectedDate, setHistoryCacheEntry, clearFixturesCache } = scoresSlice.actions;
export default scoresSlice.reducer;
