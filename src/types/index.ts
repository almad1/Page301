export interface LiveScoreMatch {
  id: number;
  time: string;
  home_name: string;
  away_name: string;
  home_id: number;
  away_id: number;
  score: string;
  ft_score: string;
  ht_score: string;
  et_score: string;
  ps_score: string;
  competition_name: string;
  competition_id: number;
  league_id: number;
  scheduled: string;
  date: string;
  status: string;
  location: string;
  has_lineups: boolean;
  fixture_id: number;
  added: string;
  last_changed: string;
}

export interface GoalEvent {
  player: string;
  time: string;
  homeAway: 'h' | 'a';
  ownGoal: boolean;
}

export interface NormalisedMatch {
  id: number;
  home_name: string;
  away_name: string;
  score: string;
  status: string;
  time: string;
  scheduled: string;
  competition_name: string;
  competition_id: number;
  date: string;
  goals?: GoalEvent[];
}

export interface League {
  id: string;
  name: string;
  country_id: string;
}

export interface TableEntry {
  position: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
