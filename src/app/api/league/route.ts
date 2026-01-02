import { NextRequest, NextResponse } from 'next/server';
import { fetchLeagueData } from '@/lib/espn-client';
import type { ESPNCredentials } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { leagueId, seasonId, espnS2, SWID } = body;

    if (!leagueId) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Default to current season if not provided
    const currentYear = new Date().getFullYear();
    const effectiveSeasonId = seasonId || currentYear;

    const credentials: ESPNCredentials = {
      leagueId: Number(leagueId),
      seasonId: Number(effectiveSeasonId),
      espnS2: espnS2 || undefined,
      SWID: SWID || undefined,
    };

    const leagueData = await fetchLeagueData(credentials);

    return NextResponse.json(leagueData);
  } catch (error) {
    console.error('Error fetching league:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
