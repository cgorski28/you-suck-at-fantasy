import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/report-generator';
import type { ESPNCredentials } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      leagueId,
      seasonId,
      espnS2,
      SWID,
      teamId,
      totalWeeks,
      playoffStartWeek,
    } = body;

    if (!leagueId || !teamId) {
      return NextResponse.json(
        { error: 'League ID and Team ID are required' },
        { status: 400 }
      );
    }

    const credentials: ESPNCredentials = {
      leagueId: Number(leagueId),
      seasonId: Number(seasonId),
      espnS2: espnS2 || undefined,
      SWID: SWID || undefined,
    };

    const report = await generateReport({
      credentials,
      teamId: Number(teamId),
      totalWeeks: Number(totalWeeks),
      playoffStartWeek: Number(playoffStartWeek),
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
