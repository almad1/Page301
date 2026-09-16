// Competition display priorities — exact position numbers from the user's provided list
export const COMPETITION_PRIORITY: Record<number, number> = {
  362: 1,   // FIFA World Cup
  387: 2,   // UEFA EURO
  244: 3,   // Champions League
  245: 4,   // Europa League
  446: 5,   // UEFA Conference League
  371: 6,   // National Teams Friendlies
  372: 7,   // FIFA Club World Cup
  11:  8,   // Premier Division (Ireland)
  2:   9,   // Premier League (England)
  1:   10,  // Bundesliga (Germany)
  4:   11,  // Serie A (Italy)
  3:   12,  // LaLiga Santander (Spain)
  5:   13,  // Ligue 1 (France)
  196: 14,  // Eredivisie (Netherlands)
  8:   15,  // Primeira Liga (Portugal)
  75:  16,  // Premiership (Scotland)
  68:  17,  // First Division A (Belgium)
  64:  18,  // Premier League (Ukraine)
  43:  19,  // Bundesliga (Austria)
  72:  20,  // 1st League (Czech Republic)
  17:  21,  // 1. HNL (Croatia)
  40:  22,  // Superliga (Denmark)
  15:  23,  // Super League (Switzerland)
  14:  24,  // Allsvenskan (Sweden)
  13:  25,  // Eliteserien (Norway)
  60:  26,  // Ekstraklasa (Poland)
  19:  27,  // NB I (Hungary)
  57:  28,  // Veikkausliiga (Finland)
  10:  29,  // Urvalsdeild (Iceland)
  69:  30,  // Premiership (Northern Ireland)
  77:  31,  // Championship (England)
  93:  32,  // 2nd Bundesliga (Germany)
  87:  33,  // Serie B (Italy)
  181: 34,  // Serie C (Italy)
  79:  35,  // Segunda Division (Spain)
  97:  36,  // Ligue 2 (France)
  199: 37,  // Eerste Divisie (Netherlands)
  92:  38,  // Segunda Liga (Portugal)
  317: 39,  // Championship (Scotland)
  136: 40,  // First Division B (Belgium)
  353: 41,  // Persha Liga (Ukraine)
  133: 42,  // Erste Liga (Austria)
  145: 43,  // 2nd League (Czech Republic)
  141: 44,  // 2nd League (Croatia)
  147: 45,  // 1st Division (Denmark)
  338: 46,  // Challenge League (Switzerland)
  336: 47,  // Superettan (Sweden)
  204: 48,  // 1 Division (Norway)
  209: 49,  // 1st Liga (Poland)
  174: 50,  // NB II (Hungary)
  216: 51,  // 1st Division (Ireland)
  82:  52,  // League 1 (England)
  83:  53,  // League 2 (England)
  154: 54,  // National League (England/Wales)
  155: 55,  // National League North/South (England/Wales)
  99:  56,  // Beker Van Belgie (Belgium)
  100: 57,  // ÖFB Cup (Austria)
  148: 58,  // 2nd Division (Denmark)
  103: 59,  // Irish Cup (Northern Ireland)
  104: 60,  // Welsh Cup (Wales)
  105: 61,  // Scottish Cup (Scotland)
  146: 62,  // 3rd League (Czech Republic)
  210: 63,  // 2nd Liga (Poland)
  111: 64,  // Cup (Poland)
  115: 65,  // Cup (Ukraine)
  125: 66,  // 1st Deild (Iceland)
  126: 67,  // Cup (Iceland)
  127: 68,  // Super Cup (Iceland)
  137: 69,  // Super Cup (Belgium)
  142: 70,  // Cup (Croatia)
  108: 71,  // Cup (Czech Republic)
  102: 72,  // DBU Pokalen (Denmark)
  152: 73,  // FA Cup (England/Wales)
  149: 74,  // Community Shield (England/Wales)
  150: 75,  // EFL Cup (England/Wales)
  151: 76,  // EFL Trophy (England/Wales)
  153: 77,  // FA Trophy (England/Wales)
  158: 78,  // Ykkonen (Finland)
  159: 79,  // Cup (Finland)
  161: 80,  // National 1 (France)
  162: 81,  // Coupe de France (France)
  163: 82,  // League Cup (France)
  160: 83,  // Super Cup (France)
  166: 84,  // 3rd Liga (Germany)
  167: 85,  // DFB Cup (Germany)
  169: 86,  // Super Cup (Germany)
  175: 87,  // Cup (Hungary)
  176: 88,  // Super Cup (Hungary)
  179: 89,  // Coppa Italia (Italy)
  178: 90,  // Super Cup (Italy)
  180: 91,  // Coppa Italia Serie C (Italy)
  182: 92,  // Serie C Super Cup (Italy)
  197: 93,  // Super Cup (Netherlands)
  198: 94,  // KNVB Beker (Netherlands)
  203: 95,  // League Cup (Northern Ireland)
  205: 96,  // Super Cup (Norway)
  206: 97,  // NM Cupen (Norway)
  207: 98,  // 2nd Division (Norway)
  208: 99,  // Super Cup (Poland)
  211: 100, // Super Cup (Portugal)
  212: 101, // Taca De Portugal (Portugal)
  213: 102, // League Cup (Portugal)
  215: 103, // FAI Presidents Cup (Ireland)
  217: 104, // FAI Cup (Ireland)
  218: 105, // League Cup (Ireland)
  274: 106, // UEFA EURO Qualification
  316: 107, // Challenge Cup (Scotland)
  318: 108, // League 1 (Scotland)
  319: 109, // League 2 (Scotland)
  320: 110, // League Cup (Scotland)
  332: 111, // Segunda B (Spain)
  333: 112, // Super Cup (Spain)
  334: 113, // Copa del Rey (Spain)
  335: 114, // Svenska Cupen (Sweden)
  337: 115, // Division 1 (Sweden)
  339: 116, // 1. Liga Promotion (Switzerland)
  340: 117, // Cup (Switzerland)
  349: 118, // Super Cup (UEFA)
  350: 119, // UEFA Nations League
  352: 120, // Super Cup (Ukraine)
  358: 121, // World Cup AFC Qualifiers
  361: 122, // World Cup CONMEBOL Qualifiers
  363: 123, // World Cup UEFA Qualifiers
  364: 124, // World Cup OFC Qualifiers
  366: 125, // Arab Club Champions Cup
  367: 126, // Atlantic Cup
  368: 127, // Audi Cup
  370: 128, // Club Teams Friendlies
  381: 129, // League Cup (Wales)
  500: 130, // Premier League Summer Series (England)
  522: 131, // Ykkosliiga (Finland)
  454: 132, // League Cup (Finland)
  451: 133, // Liga 3 (Portugal)
  437: 134, // Tipsport Winter League (Czech Republic/Slovakia)
  447: 135, // Tweede Divisie (Netherlands)
  445: 136, // Welsh Premier League (Wales)
  490: 137, // Women's World Cup
  428: 138, // League Cup (Iceland)
};

export const KNOWN_IDS = new Set(Object.keys(COMPETITION_PRIORITY).map(Number));

// The fixtures endpoint uses different competition IDs than live/history.
// ONLY include names that are globally unambiguous — omit any name used by multiple leagues
// (e.g. "Premier League", "Bundesliga", "Championship") to avoid false remapping.
const FIXTURE_NAME_TO_ID: Record<string, number> = {
  // Unique national league names
  'laliga': 3,   'laliga santander': 3,   'la liga': 3,
  'ligue 1': 5,
  'eredivisie': 196,
  'primeira liga': 8,
  'allsvenskan': 14,
  'eliteserien': 13,
  'ekstraklasa': 60,
  'veikkausliiga': 57,
  'urvalsdeild': 10,
  'superettan': 336,
  'persha liga': 353,
  'erste liga': 133,   // Austrian 2nd tier — unambiguous
  '1. hnl': 17,
  'nb i': 19,   'nb ii': 174,
  'ligue 2': 97,
  'eerste divisie': 199,
  'segunda liga': 92,
  'challenge league': 338,
  'ykkonen': 158,
  // Country-qualified names
  'scottish premiership': 75,
  'scottish championship': 317,
  'n irish premiership': 69,   'northern ireland premiership': 69,
  'austrian bundesliga': 43,
  'welsh premier league': 445,
  'primeira liga portugal': 8,
  'persha liha': 353,
  'segunda division': 79,   'segunda división': 79,
  // English football — enough context to be unambiguous
  'fa cup': 152,
  'efl cup': 150,   'carabao cup': 150,
  'community shield': 149,
  'efl trophy': 151,
  'fa trophy': 153,
  'national league': 154,
  // European club competitions
  'uefa champions league': 244,
  'europa league': 245,      'uefa europa league': 245,
  'uefa conference league': 446,
  // Domestic cups — country-specific names
  'coppa italia': 179,
  'copa del rey': 334,
  'coupe de france': 162,
  'dfb-pokal': 167,   'dfb cup': 167,
  'taca de portugal': 212,
  'beker van belgie': 99,
  'knvb beker': 198,
  'scottish cup': 105,
  'svenska cupen': 335,
  'nm cupen': 206,
};

export function canonicalCompetitionId(fixtureId: number, name: string): number {
  return FIXTURE_NAME_TO_ID[name.toLowerCase()] ?? fixtureId;
}

// Override ambiguous API names so they display clearly
const COMPETITION_DISPLAY_NAMES: Record<number, string> = {
  2:   'Premier League',
  11:  'Premier Division',
  64:  'Ukrainian Premier League',
  75:  'Scottish Premiership',
  69:  'N Irish Premiership',
  43:  'Austrian Bundesliga',
  317: 'Scottish Championship',
  318: 'Scottish League 1',
  319: 'Scottish League 2',
  82:  'League 1',
  83:  'League 2',
  154: 'National League',
  155: 'National League N/S',
  1:   'Bundesliga',
  93:  '2. Bundesliga',
  3:   'LaLiga',
  79:  'Segunda División',
  4:   'Serie A',
  87:  'Serie B',
  181: 'Serie C',
  5:   'Ligue 1',
  97:  'Ligue 2',
  196: 'Eredivisie',
  199: 'Eerste Divisie',
  8:   'Primeira Liga',
  92:  'Segunda Liga',
  68:  'First Division A',
  40:  'Superliga',
  72:  '1. Liga',
  17:  '1. HNL',
  60:  'Ekstraklasa',
  57:  'Veikkausliiga',
  10:  'Urvalsdeild',
  15:  'Super League',
  14:  'Allsvenskan',
  13:  'Eliteserien',
  19:  'NB I',
};

export function resolveCompetitionName(id: number, apiName: string): string {
  return COMPETITION_DISPLAY_NAMES[id] ?? apiName;
}

export function competitionPriority(competitionId: number): number {
  return COMPETITION_PRIORITY[competitionId] ?? 999;
}
