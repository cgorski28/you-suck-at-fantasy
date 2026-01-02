'use client';

import {
  ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE,
  DAL, DEN, DET, GB, HOU, IND, JAX, KC,
  LAC, LAR, LV, MIA, MIN, NE, NO, NYG,
  NYJ, PHI, PIT, SEA, SF, TB, WAS, TEN
} from 'react-nfl-logos';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logoMap: Record<string, React.ComponentType<any>> = {
  ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE,
  DAL, DEN, DET, GB, HOU, IND, JAX, KC,
  LAC, LAR, LV, MIA, MIN, NE, NO, NYG,
  NYJ, PHI, PIT, SEA, SF, TB, WAS, TEN,
  // Handle legacy/alternate abbreviations
  WSH: WAS,
  JAC: JAX,
  LA: LAR,
};

interface NFLTeamLogoProps {
  teamAbbreviation: string;
  size?: number;
}

export function NFLTeamLogo({ teamAbbreviation, size = 20 }: NFLTeamLogoProps) {
  const LogoComponent = logoMap[teamAbbreviation];

  if (!LogoComponent) {
    // Fallback for unknown teams (like FA for free agents)
    return null;
  }

  return <LogoComponent size={size} />;
}
