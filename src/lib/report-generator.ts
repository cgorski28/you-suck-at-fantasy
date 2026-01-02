import type {
  ESPNCredentials,
  ESPNBoxscore,
  ESPNLeague,
  ReportData,
  WeekResult,
  TeamInfo,
} from './types';
import {
  fetchBoxscoresForSeason,
  fetchLeagueSettings,
  fetchTeams,
} from './espn-client';
import {
  computeOptimalLineup,
  getActualLineup,
  buildSwapChains,
} from './optimal-lineup';

interface GenerateReportParams {
  credentials: ESPNCredentials;
  teamId: number;
  totalWeeks: number;
  playoffStartWeek: number;
}

export async function generateReport(
  params: GenerateReportParams
): Promise<ReportData> {
  const { credentials, teamId, totalWeeks, playoffStartWeek } = params;

  // Fetch all data in parallel
  const [boxscoresByWeek, leagueSettings, teams] = await Promise.all([
    fetchBoxscoresForSeason(credentials, totalWeeks),
    fetchLeagueSettings(credentials),
    fetchTeams(credentials),
  ]);

  // Find the selected team info
  const selectedTeam = teams.find((t) => t.id === teamId);
  if (!selectedTeam) {
    throw new Error('Team not found');
  }

  // Build team ID to name map
  const teamNameMap = new Map<number, string>();
  for (const team of teams) {
    teamNameMap.set(team.id, team.name);
  }

  // Process each week
  const weeks: WeekResult[] = [];
  let totalPointsLeftOnBench = 0;
  let blownWins = 0;
  let regularSeasonWins = 0;
  let regularSeasonLosses = 0;
  let playoffWins = 0;
  let playoffLosses = 0;
  let worstWeek: WeekResult | null = null;

  for (let week = 1; week <= totalWeeks; week++) {
    const boxscores = boxscoresByWeek.get(week);
    if (!boxscores) continue;

    // Find the matchup involving our team
    const matchup = boxscores.find(
      (b) => b.homeTeamId === teamId || b.awayTeamId === teamId
    );
    if (!matchup) continue;

    // Determine if we're home or away
    const isHome = matchup.homeTeamId === teamId;
    const ourRoster = isHome ? matchup.homeRoster : matchup.awayRoster;
    const ourScore = isHome ? matchup.homeScore : matchup.awayScore;
    const opponentScore = isHome ? matchup.awayScore : matchup.homeScore;
    const opponentId = isHome ? matchup.awayTeamId : matchup.homeTeamId;
    const opponentName = teamNameMap.get(opponentId) || 'Unknown Team';

    // Skip if no roster data (bye week or data unavailable)
    if (!ourRoster || ourRoster.length === 0) continue;

    // Skip if scores are missing (bye week or incomplete matchup)
    if (ourScore === undefined || ourScore === null || opponentScore === undefined || opponentScore === null) {
      continue;
    }

    // Compute optimal lineup
    const optimalLineup = computeOptimalLineup(ourRoster, leagueSettings);
    const actualLineup = getActualLineup(ourRoster);
    const actualScore = actualLineup.reduce((sum, a) => sum + a.points, 0);

    // Points missed (clamped to >= 0)
    const pointsMissed = Math.max(0, optimalLineup.totalPoints - actualScore);

    // Determine win/loss (ignore ties per spec)
    const won = ourScore > opponentScore;
    const lost = ourScore < opponentScore;
    const isPlayoffs = week >= playoffStartWeek;

    if (won) {
      if (isPlayoffs) playoffWins++;
      else regularSeasonWins++;
    }
    if (lost) {
      if (isPlayoffs) playoffLosses++;
      else regularSeasonLosses++;
    }

    // Blown win: lost but optimal score would have beaten opponent
    const isBlownWin = lost && optimalLineup.totalPoints > opponentScore;
    const blownWinMargin = isBlownWin
      ? optimalLineup.totalPoints - opponentScore
      : 0;

    if (isBlownWin) blownWins++;

    // Calculate swaps (using chain-aware algorithm)
    const swaps =
      pointsMissed > 0
        ? buildSwapChains(actualLineup, optimalLineup, ourRoster)
        : [];

    const weekResult: WeekResult = {
      week,
      isPlayoffs,
      opponentName,
      actualScore: ourScore,
      opponentScore,
      won,
      optimalScore: optimalLineup.totalPoints,
      pointsMissed,
      isBlownWin,
      blownWinMargin,
      swaps,
    };

    weeks.push(weekResult);
    totalPointsLeftOnBench += pointsMissed;

    // Track worst week (most points missed)
    if (!worstWeek || pointsMissed > worstWeek.pointsMissed) {
      worstWeek = weekResult;
    }
  }

  return {
    teamName: selectedTeam.name,
    ownerName: selectedTeam.ownerName || 'Unknown Owner',
    teamLogoURL: selectedTeam.logoURL,
    finalStandingsPosition: selectedTeam.finalStandingsPosition,
    leagueSize: teams.length,
    leagueName: leagueSettings.name,
    seasonId: credentials.seasonId,
    totalPointsLeftOnBench,
    blownWins,
    regularSeasonWins,
    regularSeasonLosses,
    playoffWins,
    playoffLosses,
    weeks,
    worstWeek,
  };
}
