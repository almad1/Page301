import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { liveScoreAPI } from '../api/footballDataClient';
import { NormalisedMatch } from '../types';
import { isEuropean } from '../utils/competitions';

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const fetchLiveMatches = createAsyncThunk(
  'scores/fetchLiveMatches',
  async () => liveScoreAPI.getLiveMatches()
);

export const fetchTodayResults = createAsyncThunk(
  'scores/fetchTodayResults',
  async (date: string) => {
    const historyMatches = await liveScoreAPI.getTodayHistoryMatches(date);
    const european = historyMatches.filter((m) =>
      isEuropean(m.competition_id, m.competition_name)
    );
    return Promise.all(
      european.map(async (m) => ({
        ...m,
        goals: await liveScoreAPI.getMatchEvents(m.id).catch(() => []),
      }))
    );
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
    clearFixturesCache: (state) => {
      state.fixturesCache = {};
      state.todayResults = [];
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
      });
  },
});

export const { clearError, setSelectedDate, clearFixturesCache, } = scoresSlice.actions;
export default scoresSlice.reducer;
