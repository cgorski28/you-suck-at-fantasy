import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'espn-fantasy-football-api/node';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, seasonId, espnS2, SWID } = body;

    const client = new Client({ leagueId: Number(leagueId) });

    if (espnS2 && SWID) {
      client.setCookies({ espnS2, SWID });
    }

    // Fetch week 1 boxscore and league info
    const [boxscores, leagueInfo] = await Promise.all([
      client.getBoxscoreForWeek({
        seasonId: Number(seasonId),
        matchupPeriodId: 1,
        scoringPeriodId: 1,
      }),
      client.getLeagueInfo({ seasonId: Number(seasonId) }),
    ]);

    // Get the first boxscore to examine its structure
    const sampleBoxscore = boxscores[0] as any;
    const sampleRoster = sampleBoxscore?.homeRoster || sampleBoxscore?.awayRoster;
    const samplePlayer = sampleRoster?.[0];

    return NextResponse.json({
      leagueSettings: {
        rosterSettings: (leagueInfo as any).rosterSettings,
        name: (leagueInfo as any).name,
      },
      sampleBoxscoreKeys: sampleBoxscore ? Object.keys(sampleBoxscore) : [],
      sampleBoxscore: sampleBoxscore ? {
        homeTeamId: (sampleBoxscore as any).homeTeamId,
        awayTeamId: (sampleBoxscore as any).awayTeamId,
        homeScore: (sampleBoxscore as any).homeScore,
        awayScore: (sampleBoxscore as any).awayScore,
        homeRosterLength: (sampleBoxscore as any).homeRoster?.length,
        awayRosterLength: (sampleBoxscore as any).awayRoster?.length,
      } : null,
      samplePlayerKeys: samplePlayer ? Object.keys(samplePlayer) : [],
      samplePlayer: samplePlayer ? {
        id: (samplePlayer as any).id,
        fullName: (samplePlayer as any).fullName,
        rosteredPosition: (samplePlayer as any).rosteredPosition,
        eligiblePositions: (samplePlayer as any).eligiblePositions,
        defaultPosition: (samplePlayer as any).defaultPosition,
        totalPoints: (samplePlayer as any).totalPoints,
      } : null,
      allPlayersPositions: sampleRoster?.map((p: any) => ({
        name: p.fullName,
        rosteredPosition: p.rosteredPosition,
        eligiblePositions: p.eligiblePositions,
        totalPoints: p.totalPoints,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
