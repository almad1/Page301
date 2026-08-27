// Competition IDs confirmed from live API data (competition_id in fixtures/history)
// NOTE: these IDs differ from the leagues/list.json id field
// Priority: lower number = shown first (tuned for an Irish user)

export const COMPETITION_PRIORITY: Record<number, number> = {
  // Irish
  11:  10,  // League of Ireland Premier Division (name: "Premier Division")

  // English
  2:   20,  // Premier League
  77:  21,  // Championship
  150: 22,  // EFL Cup
  317: 23,  // Scottish Championship (lower priority override below)

  // UEFA club competitions
  424: 30,  // UEFA Champions League
  149: 31,  // Champions League play-off
  419: 32,  420: 32, 421: 32, 422: 32, 423: 32,
  425: 32,  426: 32, 566: 32, 567: 32, 564: 32, 569: 32,
  245: 35,  // UEFA Europa League
  446: 36,  // UEFA Conference League

  // Top 5 European leagues
  3:   40,  // LaLiga Santander (Spain)
  1:   41,  // Bundesliga (Germany)
  4:   42,  // Serie A (Italy)
  5:   43,  // Ligue 1 (France)
  196: 44,  // Eredivisie (Netherlands)
  8:   45,  // Primeira Liga (Portugal)

  // Other notable European top flights
  75:  50,  // Scottish Premiership
  69:  51,  // Northern Irish Premiership
  6:   52,  // Turkish Super Lig
  7:   53,  // Russian Premier League
  61:  54,  // Romanian Liga I
  62:  55,  // Serbian Super Liga
  71:  56,  // Bulgarian First Professional League
  70:  57,  // Bosnian Premijer Liga
  22:  58,  // Slovenian Prva Liga
  43:  59,  // Austrian Bundesliga
  73:  60,  // Israeli Ligat HaAl
  321: 61,  // Serbian Prva Liga
  130: 62,  // Albanian Superliga

  // European second tiers / cups
  93:  70,  // 2nd Bundesliga (Germany)
  87:  71,  // Serie B (Italy)
  97:  72,  // Ligue 2 (France)
  79:  73,  // Segunda División (Spain)
  92:  74,  // Segunda Liga (Portugal)
  199: 75,  // Eerste Divisie (Netherlands)
  167: 76,  // DFB Cup (Germany)
  209: 77,  // 1st Liga (Poland 2nd tier)

  // Third tiers / other
  166: 80,  // 3rd Liga (Germany)
  181: 81,  // Serie C (Italy)
};

const KNOWN_IDS = new Set(Object.keys(COMPETITION_PRIORITY).map(Number));

/** Returns true if the competition should be shown in the European app */
export function isEuropean(competitionId: number, competitionName: string): boolean {
  if (KNOWN_IDS.has(competitionId)) return true;
  const n = competitionName;
  if (n.startsWith('UEFA') || n.includes('Champions League') ||
      n.includes('Europa League') || n.includes('Conference League')) return true;
  return false;
}

/** Sort priority for a competition — lower = higher up the page */
export function competitionPriority(competitionId: number, competitionName: string): number {
  if (KNOWN_IDS.has(competitionId)) return COMPETITION_PRIORITY[competitionId];
  if (competitionName.startsWith('UEFA')) return 38;
  return 999;
}
