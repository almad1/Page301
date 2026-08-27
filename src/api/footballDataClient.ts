import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { Match, LeagueStanding, Competition } from '../types';

const API_TOKEN = '7a0fbcb46fb544e98e4f970a4b3b7e47';
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8082'
  : 'https://api.football-data.org/v4';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Auth-Token': API_TOKEN,
  },
});

export const footballDataAPI = {
  async getLiveMatches(): Promise<Match[]> {
    try {
      const response = await client.get('/matches');
      return response.data.matches || [];
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  },

  async getStandings(competitionCode: string): Promise<LeagueStanding[]> {
    try {
      const response = await client.get(`/competitions/${competitionCode}/standings`);
      return response.data.standings?.[0]?.table || [];
    } catch (error) {
      console.error(`Error fetching standings for ${competitionCode}:`, error);
      return [];
    }
  },

  async getCompetitionMatches(competitionCode: string, limit: number = 20): Promise<Match[]> {
    try {
      const response = await client.get(`/competitions/${competitionCode}/matches`, {
        params: { limit },
      });
      return response.data.matches || [];
    } catch (error) {
      console.error(`Error fetching matches for ${competitionCode}:`, error);
      return [];
    }
  },

  async getCompetitions(): Promise<Competition[]> {
    try {
      const response = await client.get('/competitions');
      return response.data.competitions || [];
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return [];
    }
  },
};
