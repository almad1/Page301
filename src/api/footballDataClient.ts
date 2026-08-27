import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { LiveScoreMatch, NormalisedMatch, League } from '../types';

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
      return matches.map(normaliseLive);
    } catch (error) {
      console.error('Error fetching live matches:', error);
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
};
