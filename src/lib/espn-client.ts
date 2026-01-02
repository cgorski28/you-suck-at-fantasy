import { Client } from 'espn-fantasy-football-api/node';
import type {
  ESPNCredentials,
  ESPNTeam,
  ESPNBoxscore,
  ESPNBoxscorePlayer,
  ESPNLeague,
  LeagueData,
  TeamInfo,
} from './types';

/**
 * Slot types that ESPN incorrectly returns as player positions
 * These should be removed from eligiblePositions arrays
 */
const INVALID_PLAYER_POSITIONS = ['RB/WR', 'RB/WR/TE', 'WR/TE', 'OP'];

/**
 * Sanitize player data to fix ESPN's incorrect position data
 * - Changes defaultPosition "RB/WR" to "WR" (all affected players are actually WRs)
 * - Removes slot types from eligiblePositions (they're not real player positions)
 */
function sanitizePlayer(player: ESPNBoxscorePlayer): ESPNBoxscorePlayer {
  let defaultPosition = player.defaultPosition;

  // Fix defaultPosition if it's a slot type
  if (defaultPosition === 'RB/WR') {
    defaultPosition = 'WR';
  }

  // Remove slot types from eligiblePositions
  const eligiblePositions = player.eligiblePositions.filter(
    pos => !INVALID_PLAYER_POSITIONS.includes(pos)
  );

  return {
    ...player,
    defaultPosition,
    eligiblePositions,
  };
}

/**
 * Sanitize all players in a boxscore
 */
function sanitizeBoxscore(boxscore: ESPNBoxscore): ESPNBoxscore {
  return {
    ...boxscore,
    homeRoster: boxscore.homeRoster?.map(sanitizePlayer) || [],
    awayRoster: boxscore.awayRoster?.map(sanitizePlayer) || [],
  };
}

/**
 * Server-side ESPN Fantasy Football API wrapper
 * All ESPN requests must go through this module
 */

interface ESPNClientOptions {
  leagueId: number;
  espnS2?: string;
  SWID?: string;
}

function createClient(options: ESPNClientOptions): typeof Client.prototype {
  const client = new Client({ leagueId: options.leagueId });

  if (options.espnS2 && options.SWID) {
    client.setCookies({
      espnS2: options.espnS2,
      SWID: options.SWID,
    });
  }

  return client;
}

export async function fetchLeagueData(
  credentials: ESPNCredentials
): Promise<LeagueData> {
  const client = createClient({
    leagueId: credentials.leagueId,
    espnS2: credentials.espnS2,
    SWID: credentials.SWID,
  });

  // Fetch league info and teams
  const [leagueInfo, teams] = await Promise.all([
    client.getLeagueInfo({ seasonId: credentials.seasonId }) as Promise<ESPNLeague>,
    client.getTeamsAtWeek({
      seasonId: credentials.seasonId,
      scoringPeriodId: 1,
    }) as Promise<ESPNTeam[]>,
  ]);

  const scheduleSettings = leagueInfo.scheduleSettings;
  const regularSeasonWeeks = scheduleSettings.numberOfRegularSeasonMatchups;
  const playoffWeeks = scheduleSettings.numberOfPlayoffMatchups;
  const totalWeeks = regularSeasonWeeks + playoffWeeks;
  const playoffStartWeek = regularSeasonWeeks + 1;

  const teamInfos: TeamInfo[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    ownerName: team.ownerName || 'Unknown Owner',
    logoURL: team.logoURL,
    finalStandingsPosition: team.finalStandingsPosition,
  }));

  return {
    leagueId: credentials.leagueId,
    seasonId: credentials.seasonId,
    leagueName: leagueInfo.name,
    teams: teamInfos,
    totalWeeks,
    playoffStartWeek,
  };
}

export async function fetchBoxscoresForSeason(
  credentials: ESPNCredentials,
  totalWeeks: number
): Promise<Map<number, ESPNBoxscore[]>> {
  const client = createClient({
    leagueId: credentials.leagueId,
    espnS2: credentials.espnS2,
    SWID: credentials.SWID,
  });

  const boxscoresByWeek = new Map<number, ESPNBoxscore[]>();

  // Fetch all weeks in parallel
  const weekPromises: Promise<{ week: number; boxscores: ESPNBoxscore[] }>[] = [];
  for (let week = 1; week <= totalWeeks; week++) {
    weekPromises.push(
      (client.getBoxscoreForWeek({
        seasonId: credentials.seasonId,
        matchupPeriodId: week,
        scoringPeriodId: week,
      }) as Promise<ESPNBoxscore[]>).then((boxscores) => ({
        week,
        boxscores: boxscores.map(sanitizeBoxscore),
      }))
    );
  }

  const results = await Promise.all(weekPromises);

  for (const { week, boxscores } of results) {
    boxscoresByWeek.set(week, boxscores);
  }

  return boxscoresByWeek;
}

export async function fetchLeagueSettings(
  credentials: ESPNCredentials
): Promise<ESPNLeague> {
  const client = createClient({
    leagueId: credentials.leagueId,
    espnS2: credentials.espnS2,
    SWID: credentials.SWID,
  });

  return client.getLeagueInfo({ seasonId: credentials.seasonId }) as Promise<ESPNLeague>;
}

export async function fetchTeams(
  credentials: ESPNCredentials
): Promise<ESPNTeam[]> {
  const client = createClient({
    leagueId: credentials.leagueId,
    espnS2: credentials.espnS2,
    SWID: credentials.SWID,
  });

  return client.getTeamsAtWeek({
    seasonId: credentials.seasonId,
    scoringPeriodId: 1,
  }) as Promise<ESPNTeam[]>;
}
