export interface Match {
  id: number;
  utcDate: string;
  status: 'TIMED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED';
  stage: string;
  matchday?: number;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  odds?: object;
  referees: Referee[];
}

export interface Team {
  id: number;
  name: string;
  shortName?: string;
  tla: string;
  crest?: string;
}

export interface Score {
  winner?: string;
  duration: string;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Referee {
  id: number;
  name: string;
  type: string;
  nationality: string;
}

export interface LeagueStanding {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  areaName: string;
  currentSeason: { id: number; startDate: string; endDate: string };
}
