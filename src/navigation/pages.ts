export interface LeaguePage {
  page: number;
  competitionId: number;
  name: string;
}

function localDateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns the date string that page 301/302/303 should show */
export function dateForPage(page: number): string {
  if (page === 302) return localDateStr(-1);
  if (page === 303) return localDateStr(1);
  return localDateStr(0); // 301 = today
}

/** Maps a date string back to its canonical page number */
export function pageForDate(dateStr: string): number {
  if (dateStr === localDateStr(0)) return 301;
  if (dateStr === localDateStr(-1)) return 302;
  if (dateStr === localDateStr(1)) return 303;
  return 301;
}

export const LEAGUE_PAGES: LeaguePage[] = [
  // Top flights — ordered to match user's competition priority list
  { page: 304, competitionId: 11,  name: 'League of Ireland' },
  { page: 305, competitionId: 2,   name: 'Premier League' },
  { page: 306, competitionId: 1,   name: 'Bundesliga' },
  { page: 307, competitionId: 4,   name: 'Serie A' },
  { page: 308, competitionId: 3,   name: 'LaLiga' },
  { page: 309, competitionId: 5,   name: 'Ligue 1' },
  { page: 310, competitionId: 196, name: 'Eredivisie' },
  { page: 311, competitionId: 8,   name: 'Primeira Liga' },
  { page: 312, competitionId: 75,  name: 'Scottish Premiership' },
  { page: 313, competitionId: 68,  name: 'First Division A' },
  { page: 314, competitionId: 64,  name: 'Ukrainian Premier League' },
  { page: 315, competitionId: 43,  name: 'Austrian Bundesliga' },
  { page: 316, competitionId: 72,  name: 'Czech 1. Liga' },
  { page: 317, competitionId: 17,  name: '1. HNL' },
  { page: 318, competitionId: 40,  name: 'Superliga' },
  { page: 319, competitionId: 15,  name: 'Super League' },
  { page: 320, competitionId: 14,  name: 'Allsvenskan' },
  { page: 321, competitionId: 13,  name: 'Eliteserien' },
  { page: 322, competitionId: 60,  name: 'Ekstraklasa' },
  { page: 323, competitionId: 19,  name: 'NB I' },
  { page: 324, competitionId: 57,  name: 'Veikkausliiga' },
  { page: 325, competitionId: 10,  name: 'Urvalsdeild' },
  { page: 326, competitionId: 69,  name: 'N Irish Premiership' },
  // Second tiers & lower
  { page: 327, competitionId: 77,  name: 'Championship' },
  { page: 328, competitionId: 93,  name: '2. Bundesliga' },
  { page: 329, competitionId: 87,  name: 'Serie B' },
  { page: 330, competitionId: 79,  name: 'Segunda División' },
  { page: 331, competitionId: 97,  name: 'Ligue 2' },
  { page: 332, competitionId: 82,  name: 'League 1' },
  { page: 333, competitionId: 83,  name: 'League 2' },
  { page: 334, competitionId: 216, name: 'First Division (IRL)' },
  { page: 335, competitionId: 317, name: 'Scottish Championship' },
  { page: 336, competitionId: 136, name: 'First Division B' },
  { page: 337, competitionId: 353, name: 'Persha Liga' },
  { page: 338, competitionId: 445, name: 'Welsh Premier League' },
];

export function getLeaguePage(competitionId: number): LeaguePage | undefined {
  return LEAGUE_PAGES.find(p => p.competitionId === competitionId);
}
