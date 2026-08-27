import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { LiveScoreMatch, NormalisedMatch, League, GoalEvent, TableEntry } from '../types';

const API_KEY = 'i3obDQOhV7mA4eIq';
const API_SECRET = 'gHpFdaQ9l0zKvdmNhLZVBNdxVz7ZOPp5';
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8082'
  : 'https://livescore-api.com/api-client';

const client: AxiosInstance = axios.create({ baseURL: BASE_URL });
const auth = { key: API_KEY, secret: API_SECRET };

function normaliseLive(m: LiveScoreMatch): NormalisedMatch {
  return {
    id: m.id,
    home_name: m.home_name,
    away_name: m.away_name,
    score: m.score || '',
    status: m.status,
    time: m.time,
    scheduled: m.scheduled,
    competition_name: m.competition_name,
    competition_id: m.competition_id,
    date: m.date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseHistory(m: any): NormalisedMatch {
  return {
    id: Number(m.id),
    home_name: m.home_name,
    away_name: m.away_name,
    score: m.score || m.ft_score || '',
    status: 'FINISHED',
    time: 'FT',
    scheduled: m.scheduled || '',
    competition_name: m.competition_name || '',
    competition_id: Number(m.competition_id) || 0,
    date: m.date || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseFixture(f: any): NormalisedMatch {
  return {
    id: f.id,
    home_name: f.home_name,
    away_name: f.away_name,
    score: '',
    status: 'SCHEDULED',
    time: 'SCHED',
    scheduled: f.time ? f.time.slice(0, 5) : '',
    competition_name: f.competition?.name || '',
    competition_id: f.competition?.id ?? f.competition_id ?? 0,
    date: f.date,
  };
}

export const liveScoreAPI = {
  async getLiveMatches(): Promise<NormalisedMatch[]> {
    try {
      const response = await client.get('/scores/live.json', { params: auth });
      const matches: LiveScoreMatch[] = response.data?.data?.match || [];
      const normalised = matches.map(normaliseLive);
      // Fetch goal events for each live match in parallel
      return Promise.all(
        normalised.map(async (m) => ({
          ...m,
          goals: await liveScoreAPI.getMatchEvents(m.id),
        }))
      );
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  },

  async getMatchEvents(matchId: number): Promise<GoalEvent[]> {
    try {
      const response = await client.get('/scores/events.json', {
        params: { ...auth, id: matchId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const events: any[] = response.data?.data?.event || [];
      return events
        .filter((e) => e.event === 'GOAL' || e.event === 'OWN_GOAL')
        .map((e) => ({
          player: e.player as string,
          time: e.time as string,
          homeAway: e.home_away as 'h' | 'a',
          ownGoal: e.event === 'OWN_GOAL',
        }));
    } catch {
      return [];
    }
  },

  async getTodayHistoryMatches(todayDate: string): Promise<NormalisedMatch[]> {
    try {
      // Fetch page 1 to get total_pages count
      const first = await client.get('/scores/history.json', { params: auth });
      const totalPages: number = first.data?.data?.total_pages || 1;

      // Fetch last 5 pages in parallel to capture today's finished matches
      const pages = await Promise.all(
        Array.from({ length: 5 }, (_, i) => Math.max(1, totalPages - i)).map((page) =>
          client
            .get('/scores/history.json', { params: { ...auth, page } })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((r): any[] => r.data?.data?.match || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((): any[] => [])
        )
      );

      return pages.flat()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) => m.date === todayDate)
        .map(normaliseHistory);
    } catch (error) {
      console.error('Error fetching today history:', error);
      return [];
    }
  },

  async getFixtures(date: string): Promise<NormalisedMatch[]> {
    try {
      // Fetch page 1 first to detect if more pages exist
      const first = await client.get('/fixtures/matches.json', {
        params: { ...auth, date, page: 1 },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstData = first.data?.data as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstFixtures: any[] = firstData?.fixtures || [];

      if (!firstData?.next_page) {
        return firstFixtures.map(normaliseFixture);
      }

      // Pages 2-20 fetched in parallel; extras return empty arrays gracefully
      const remainingResults = await Promise.all(
        Array.from({ length: 19 }, (_, i) => i + 2).map((page) =>
          client
            .get('/fixtures/matches.json', { params: { ...auth, date, page } })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((r) => (r.data?.data?.fixtures as any[]) || [])
            .catch(() => [])
        )
      );

      return [...firstFixtures, ...remainingResults.flat()].map(normaliseFixture);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return [];
    }
  },

  async getLeagues(): Promise<League[]> {
    try {
      const response = await client.get('/leagues/list.json', { params: auth });
      return response.data?.data?.league || [];
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return [];
    }
  },

  async getLeagueTable(competitionId: number): Promise<TableEntry[]> {
    try {
      const response = await client.get('/leagues/table.json', {
        params: { ...auth, competition_id: competitionId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = response.data?.data?.table || [];
      return rows.map((r) => ({
        position: Number(r.rank ?? r.position ?? 0),
        team_name: r.name || r.team_name || '',
        played: Number(r.matches ?? r.played ?? 0),
        won: Number(r.won ?? 0),
        drawn: Number(r.drawn ?? 0),
        lost: Number(r.lost ?? 0),
        goals_for: Number(r.goals_scored ?? r.goals_for ?? 0),
        goals_against: Number(r.goals_conceded ?? r.goals_against ?? 0),
        goal_difference: Number(r.goal_diff ?? r.goal_difference ?? 0),
        points: Number(r.points ?? 0),
      }));
    } catch (error) {
      console.error('Error fetching league table:', error);
      return [];
    }
  },
};
