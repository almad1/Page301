import axios, { AxiosInstance } from 'axios';
import { LiveScoreMatch, NormalisedMatch, League, GoalEvent, CardEvent, MatchEvents, TableEntry } from '../types';
import { resolveCompetitionName, canonicalCompetitionId } from '../utils/competitions';

// All requests go through the Cloudflare Worker — API key lives there, not in the app
const BASE_URL = 'https://page301-proxy.page301-proxy.workers.dev';

const client: AxiosInstance = axios.create({ baseURL: BASE_URL, timeout: 25000 });

function normaliseLive(m: LiveScoreMatch): NormalisedMatch {
  // If last_changed is more than 2 hours ago and the match is still "IN PLAY",
  // the API has orphaned the record — treat it as finished so it stops showing as live.
  let status = m.status;
  let time = m.time;
  if (m.status === 'IN PLAY' && m.last_changed) {
    const lastChanged = new Date(m.last_changed + 'Z').getTime();
    const staleMs = Date.now() - lastChanged;
    if (staleMs > 2 * 60 * 60 * 1000) {
      status = 'FINISHED';
      time = 'FT';
    }
  }
  return {
    id: m.id,
    home_name: decodeHtml(m.home_name),
    away_name: decodeHtml(m.away_name),
    score: m.score || '',
    status,
    time,
    scheduled: m.scheduled,
    competition_name: resolveCompetitionName(m.competition_id, m.competition_name),
    competition_id: m.competition_id,
    date: m.date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseHistory(m: any): NormalisedMatch {
  const id = Number(m.competition_id) || 0;
  return {
    id: Number(m.id),
    home_name: decodeHtml(m.home_name),
    away_name: decodeHtml(m.away_name),
    score: m.score || m.ft_score || '',
    status: 'FINISHED',
    time: 'FT',
    scheduled: m.scheduled || '',
    competition_name: resolveCompetitionName(id, m.competition_name || ''),
    competition_id: id,
    date: m.date || '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&apos;/gi, "'");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseFixture(f: any): NormalisedMatch {
  const rawId = f.competition?.id ?? f.competition_id ?? 0;
  const apiName = f.competition?.name || '';
  // Fixtures use different IDs than live/history — remap to canonical ID by name
  const compId = canonicalCompetitionId(rawId, apiName);
  return {
    id: f.id,
    home_name: decodeHtml(f.home_name),
    away_name: decodeHtml(f.away_name),
    score: '',
    status: 'SCHEDULED',
    time: 'SCHED',
    scheduled: f.time ? f.time.slice(0, 5) : '',
    competition_name: resolveCompetitionName(compId, apiName),
    competition_id: compId,
    date: f.date,
  };
}

export const liveScoreAPI = {
  async getLiveMatches(): Promise<NormalisedMatch[]> {
    try {
      const response = await client.get('/scores/live.json');
      const matches: LiveScoreMatch[] = response.data?.data?.match || [];
      return matches.map(normaliseLive);
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  },

  async getMatchEvents(matchId: number): Promise<MatchEvents> {
    try {
      const response = await client.get('/scores/events.json', {
        params: { id: matchId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const events: any[] = response.data?.data?.event || [];

      const GOAL_TYPES = new Set(['GOAL', 'OWN_GOAL', 'GOAL_PENALTY', 'PENALTY_GOAL', 'PENALTY']);
      const CARD_TYPES = new Set(['YELLOW_CARD', 'RED_CARD', 'YELLOW_RED_CARD', 'YELLOWCARD', 'REDCARD']);

      const goals: GoalEvent[] = events
        .filter((e) => GOAL_TYPES.has(e.event))
        .map((e) => ({
          player: e.player as string,
          time: e.time as string,
          homeAway: e.home_away as 'h' | 'a',
          ownGoal: e.event === 'OWN_GOAL',
          penalty: e.event === 'GOAL_PENALTY' || e.event === 'PENALTY_GOAL' || e.event === 'PENALTY',
        }));

      const cards: CardEvent[] = events
        .filter((e) => CARD_TYPES.has(e.event))
        .map((e) => ({
          player: e.player as string,
          time: e.time as string,
          homeAway: e.home_away as 'h' | 'a',
          cardType: (e.event === 'RED_CARD' || e.event === 'REDCARD')
            ? 'red'
            : (e.event === 'YELLOW_RED_CARD' ? 'yellow_red' : 'yellow'),
        }));

      return { goals, cards };
    } catch {
      return { goals: [], cards: [] };
    }
  },

  async getDailyResults(date: string): Promise<NormalisedMatch[]> {
    try {
      const res = await client.get('/scores/daily.json', { params: { date } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matches: any[] = res.data?.data?.match || [];
      return matches.map(normaliseLive);
    } catch {
      return [];
    }
  },

  async getHistoryForDate(targetDate: string): Promise<NormalisedMatch[]> {
    try {
      // Page 1 = oldest data; highest page = most recent. Fetch page 1 only to learn totalPages.
      const meta = await client.get('/scores/history.json');
      const totalPages: number = meta.data?.data?.total_pages || 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const found: any[] = [];
      let passedTarget = false;
      let page = totalPages; // start from most recent page
      const BATCH = 3;

      while (!passedTarget && page >= 1) {
        const batchStart = Math.max(1, page - BATCH + 1);
        const pageNums = Array.from({ length: page - batchStart + 1 }, (_, i) => batchStart + i);

        const results = await Promise.all(
          pageNums.map((p) =>
            client
              .get('/scores/history.json', { params: { page: p } })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .then((r): any[] => r.data?.data?.match || [])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .catch((): any[] => [])
          )
        );

        for (const m of results.flat()) {
          if (m.date === targetDate) found.push(m);
          if (m.date < targetDate) passedTarget = true;
        }

        page = batchStart - 1;
      }

      return found.map(normaliseHistory);
    } catch (error) {
      console.error('Error fetching history for date:', error);
      return [];
    }
  },

  async getRecentHistory(numPages = 2): Promise<Record<string, NormalisedMatch[]>> {
    try {
      const first = await client.get('/scores/history.json');
      const totalPages: number = first.data?.data?.total_pages || 1;

      const pageNums = Array.from({ length: numPages }, (_, i) => Math.max(1, totalPages - i));
      const pages = await Promise.all(
        pageNums.map((page) =>
          client
            .get('/scores/history.json', { params: { page } })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((r): any[] => r.data?.data?.match || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((): any[] => [])
        )
      );

      const byDate: Record<string, NormalisedMatch[]> = {};
      for (const m of pages.flat()) {
        const norm = normaliseHistory(m);
        if (!byDate[norm.date]) byDate[norm.date] = [];
        byDate[norm.date].push(norm);
      }
      return byDate;
    } catch (error) {
      console.error('Error fetching recent history:', error);
      return {};
    }
  },

  async getFixtures(date: string): Promise<NormalisedMatch[]> {
    try {
      const MAX_PAGES = 15;
      // Fetch page 1 first to check whether more pages exist
      const res1 = await client.get('/fixtures/matches.json', { params: { date, page: 1 } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data1 = res1.data?.data as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstBatch: any[] = data1?.fixtures || [];
      if (!data1?.next_page) return firstBatch.map(normaliseFixture);

      // More pages exist — fire them all in parallel rather than sequentially
      const remaining = await Promise.all(
        Array.from({ length: MAX_PAGES - 1 }, (_, i) => i + 2).map((p) =>
          client
            .get('/fixtures/matches.json', { params: { date, page: p } })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((r) => (r.data?.data as any)?.fixtures as any[] || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((): any[] => [])
        )
      );

      return [...firstBatch, ...remaining.flat()].map(normaliseFixture);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return [];
    }
  },

  async batchEnrichWithEvents(
    matches: NormalisedMatch[],
    concurrency = 5,
  ): Promise<NormalisedMatch[]> {
    const result: NormalisedMatch[] = [...matches];
    for (let i = 0; i < matches.length; i += concurrency) {
      const slice = matches.slice(i, i + concurrency);
      const events = await Promise.all(
        slice.map((m) =>
          liveScoreAPI.getMatchEvents(m.id)
            .catch(() => ({ goals: [], cards: [] }))
        ),
      );
      events.forEach((ev, j) => {
        result[i + j] = { ...result[i + j], goals: ev.goals, cards: ev.cards };
      });
    }
    return result;
  },

  async getLeagues(): Promise<League[]> {
    try {
      const response = await client.get('/leagues/list.json');
      return response.data?.data?.league || [];
    } catch (error) {
      console.error('Error fetching leagues:', error);
      return [];
    }
  },

  async getLeagueTable(competitionId: number): Promise<TableEntry[]> {
    try {
      const response = await client.get('/leagues/table.json', {
        params: { competition_id: competitionId },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = response.data?.data?.table || [];
      return rows.map((r) => ({
        position: Number(r.rank ?? r.position ?? 0),
        team_name: decodeHtml(r.name || r.team_name || ''),
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
