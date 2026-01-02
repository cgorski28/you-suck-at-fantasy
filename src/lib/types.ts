// ESPN API Types (from espn-fantasy-football-api)

export interface ESPNCredentials {
  leagueId: number;
  seasonId: number;
  espnS2?: string;
  SWID?: string;
}

export interface ESPNTeam {
  id: number;
  name: string;
  abbreviation: string;
  ownerName: string;
  logoURL?: string;
  wins: number;
  losses: number;
  ties: number;
  totalPointsScored: number;
  playoffSeed: number;
  finalStandingsPosition: number;
}

export interface ESPNBoxscorePlayer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  proTeam: string;
  proTeamAbbreviation: string;
  defaultPosition: string;
  eligiblePositions: string[];
  rosteredPosition: string;
  totalPoints: number;
  projectedPoints?: number;
}

export interface ESPNBoxscore {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  homeRoster: ESPNBoxscorePlayer[];
  awayRoster: ESPNBoxscorePlayer[];
}

export interface ESPNLeague {
  name: string;
  size: number;
  isPublic: boolean;
  currentMatchupPeriodId: number;
  currentScoringPeriodId: number;
  rosterSettings: {
    lineupPositionCount: Record<string, number>;
    positionLimits: Record<string, number>;
  };
  scheduleSettings: {
    numberOfRegularSeasonMatchups: number;
    regularSeasonMatchupLength: number;
    numberOfPlayoffMatchups: number;
    playoffMatchupLength: number;
    numberOfPlayoffTeams: number;
  };
}

// App-specific types

export interface TeamInfo {
  id: number;
  name: string;
  ownerName: string;
  logoURL?: string;
  finalStandingsPosition?: number;
}

export interface LeagueData {
  leagueId: number;
  seasonId: number;
  leagueName: string;
  teams: TeamInfo[];
  totalWeeks: number;
  playoffStartWeek: number;
}

export interface PlayerSlotAssignment {
  player: ESPNBoxscorePlayer;
  slot: string;
  points: number;
}

export interface OptimalLineup {
  starters: PlayerSlotAssignment[];
  totalPoints: number;
}

export interface LineupSwap {
  benchPlayer: ESPNBoxscorePlayer;
  startedPlayer: ESPNBoxscorePlayer;
  pointsGained: number;
  slot: string; // The slot where the swap should happen (where startedPlayer was)
}

// Display-friendly slot names
export const SLOT_DISPLAY_NAMES: Record<string, string> = {
  'RB/WR/TE': 'FLEX',
  'RB/WR': 'FLEX',
  'WR/TE': 'FLEX',
  'OP': 'SUPERFLEX',
  'D/ST': 'D/ST',
};

export interface WeekResult {
  week: number;
  isPlayoffs: boolean;
  opponentName: string;
  actualScore: number;
  opponentScore: number;
  won: boolean;
  optimalScore: number;
  pointsMissed: number;
  isBlownWin: boolean;
  blownWinMargin: number;
  swaps: LineupSwap[];
}

export interface ReportData {
  teamName: string;
  ownerName: string;
  teamLogoURL?: string;
  finalStandingsPosition?: number;
  leagueSize: number;
  leagueName: string;
  seasonId: number;
  totalPointsLeftOnBench: number;
  blownWins: number;
  regularSeasonWins: number;
  regularSeasonLosses: number;
  playoffWins: number;
  playoffLosses: number;
  weeks: WeekResult[];
  worstWeek: WeekResult | null;
}

// Slot eligibility mapping
// These are the ESPN slot IDs and their eligible positions
export const SLOT_ELIGIBILITY: Record<string, string[]> = {
  QB: ['QB'],
  RB: ['RB'],
  WR: ['WR'],
  TE: ['TE'],
  K: ['K'],
  'D/ST': ['D/ST'],
  FLEX: ['RB', 'WR', 'TE'],
  'RB/WR': ['RB', 'WR'],
  'WR/TE': ['WR', 'TE'],
  'RB/WR/TE': ['RB', 'WR', 'TE'],
  OP: ['QB', 'RB', 'WR', 'TE'],  // SUPERFLEX
  DL: ['DT', 'DE'],
  LB: ['LB'],
  DB: ['CB', 'S'],
  DP: ['DT', 'DE', 'LB', 'CB', 'S'],  // Defensive player flex
};

// Slots that are considered "starter" slots (not bench/IR)
export const STARTER_SLOTS = [
  'QB', 'RB', 'WR', 'TE', 'K', 'D/ST',
  'FLEX', 'RB/WR', 'WR/TE', 'RB/WR/TE', 'OP',
  'DL', 'LB', 'DB', 'DP'
];

export const BENCH_SLOTS = ['Bench', 'IR'];
