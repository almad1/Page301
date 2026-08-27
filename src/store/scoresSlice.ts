import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { footballDataAPI } from '../api/footballDataClient';
import { Match, LeagueStanding } from '../types';

export const fetchLiveMatches = createAsyncThunk(
  'scores/fetchLiveMatches',
  async () => {
    return await footballDataAPI.getLiveMatches();
  }
);

export const fetchStandings = createAsyncThunk(
  'scores/fetchStandings',
  async (competitionCode: string) => {
    return await footballDataAPI.getStandings(competitionCode);
  }
);

export const fetchCompetitionMatches = createAsyncThunk(
  'scores/fetchCompetitionMatches',
  async (competitionCode: string) => {
    return await footballDataAPI.getCompetitionMatches(competitionCode);
  }
);

interface ScoresState {
  liveMatches: Match[];
  standings: Record<string, LeagueStanding[]>;
  competitionMatches: Record<string, Match[]>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: ScoresState = {
  liveMatches: [],
  standings: {},
  competitionMatches: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

const scoresSlice = createSlice({
  name: 'scores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
      .addCase(fetchStandings.fulfilled, (state, action) => {
        state.standings[action.meta.arg] = action.payload;
      })
      .addCase(fetchCompetitionMatches.fulfilled, (state, action) => {
        state.competitionMatches[action.meta.arg] = action.payload;
      });
  },
});

export const { clearError } = scoresSlice.actions;
export default scoresSlice.reducer;
