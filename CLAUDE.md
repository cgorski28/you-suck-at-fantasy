# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**yousuckatfantasyfootball.com** - A Next.js web app that generates playful roast reports for ESPN fantasy football seasons based on points left on the bench and sub-optimal management decisions.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- `espn-fantasy-football-api` for ESPN data

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main page with multi-step form flow
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles
│   └── api/
│       ├── league/route.ts   # POST: Fetch league data and team list
│       └── report/route.ts   # POST: Generate roast report
├── components/
│   ├── LeagueForm.tsx        # League ID and credentials input
│   ├── TeamSelect.tsx        # Team selection dropdown
│   ├── Report.tsx            # Full report display with synopsis
│   ├── WeeklySection.tsx     # Individual week breakdown card
│   └── LoadingState.tsx      # Loading spinner with rotating messages
└── lib/
    ├── types.ts              # TypeScript types and slot eligibility constants
    ├── espn-client.ts        # Server-side ESPN API wrapper
    ├── optimal-lineup.ts     # Optimal lineup computation engine
    ├── report-generator.ts   # Report data aggregation
    ├── copy.ts               # Roast copy/text generation
    └── espn-fantasy-football-api.d.ts  # Type declarations for ESPN package
```

## Key Modules

### Optimal Lineup Engine (`src/lib/optimal-lineup.ts`)

Uses backtracking with pruning to find the true optimal lineup assignment. Handles:
- Multiple FLEX slots
- SUPERFLEX/OP slots
- Position eligibility from `SLOT_ELIGIBILITY` map
- Deterministic tie-breaking (points desc → playerId asc)

The algorithm:
1. Parses league roster settings to get slot requirements
2. Sorts slots by restrictiveness (fewer eligible positions first)
3. Uses backtracking to find max-weight player-slot assignment
4. Calculates swaps needed to go from actual to optimal lineup

### ESPN Client (`src/lib/espn-client.ts`)

Server-side only wrapper. All ESPN API calls must go through this module. Cookies are never exposed to client JS.

### Report Generator (`src/lib/report-generator.ts`)

Orchestrates data fetching and computation:
1. Fetches all boxscores for the season in parallel
2. For each week, computes optimal lineup and compares to actual
3. Calculates points missed, blown wins, and swap recommendations

## ESPN Fantasy Football API

### Authentication

Private leagues require `espnS2` and `SWID` cookies from the user's browser.

### Key Data Models

**BoxscorePlayer** - Most important for lineup analysis:
- `rosteredPosition` - lineup slot ("QB", "RB", "Bench", etc.)
- `eligiblePositions` - positions the player can play
- `totalPoints` - actual fantasy points scored

**League.rosterSettings.lineupSlotCounts** - Dict of slot name → count, used to derive optimal lineup rules dynamically.

### Limitations

- Historical data before 2017 may be incomplete
- Private league access only works in Node.js
- ESPN controls data availability; older boxscores may lack roster data

## Design Constraints

- ESPN-style visual language (white backgrounds, green accents)
- Humor comes from copy only, not visuals
- Screenshot-friendly above-the-fold synopsis
- No persistence - fully ephemeral, refreshing recomputes everything
- Deterministic results - same inputs always produce same output
