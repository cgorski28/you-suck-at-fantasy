import type {
  ESPNBoxscorePlayer,
  ESPNLeague,
  OptimalLineup,
  PlayerSlotAssignment,
  LineupSwap,
} from './types';
import { SLOT_ELIGIBILITY, BENCH_SLOTS } from './types';

/**
 * Optimal Lineup Computation Engine
 *
 * Uses a max-weight bipartite matching approach to find the optimal lineup.
 * This handles complex scenarios like multiple FLEX slots, SUPERFLEX, etc.
 */

interface SlotRequirement {
  slot: string;
  count: number;
  eligiblePositions: string[];
}

/**
 * Parse league roster settings to get slot requirements
 */
export function parseSlotRequirements(league: ESPNLeague): SlotRequirement[] {
  const lineupPositionCount = league.rosterSettings?.lineupPositionCount || {};
  const requirements: SlotRequirement[] = [];

  for (const [slot, count] of Object.entries(lineupPositionCount)) {
    // Skip bench and IR slots
    if (BENCH_SLOTS.includes(slot)) continue;
    if (count <= 0) continue;

    const eligiblePositions = SLOT_ELIGIBILITY[slot] || [slot];

    requirements.push({
      slot,
      count,
      eligiblePositions,
    });
  }

  return requirements;
}

/**
 * Check if a player is eligible for a slot
 * Note: Player data is sanitized at fetch time (see espn-client.ts) to remove
 * invalid slot-type positions like "RB/WR" from eligiblePositions
 */
function isPlayerEligibleForSlot(
  player: ESPNBoxscorePlayer,
  eligiblePositions: string[]
): boolean {
  return player.eligiblePositions.some((pos) =>
    eligiblePositions.includes(pos)
  );
}

/**
 * Expand slot requirements into individual slot instances
 * e.g., { slot: 'RB', count: 2 } -> [{ slot: 'RB', ... }, { slot: 'RB', ... }]
 */
function expandSlots(requirements: SlotRequirement[]): SlotRequirement[] {
  const expanded: SlotRequirement[] = [];

  for (const req of requirements) {
    for (let i = 0; i < req.count; i++) {
      expanded.push({ ...req });
    }
  }

  return expanded;
}

/**
 * Sort slots to prioritize more restrictive slots first
 * This helps the greedy/backtracking algorithm make better choices
 */
function sortSlotsByRestrictiveness(slots: SlotRequirement[]): SlotRequirement[] {
  return [...slots].sort((a, b) => {
    // Fewer eligible positions = more restrictive = should be filled first
    return a.eligiblePositions.length - b.eligiblePositions.length;
  });
}

/**
 * Compute optimal lineup using backtracking with pruning
 * This guarantees finding the true optimal solution
 */
export function computeOptimalLineup(
  roster: ESPNBoxscorePlayer[],
  league: ESPNLeague
): OptimalLineup {
  const requirements = parseSlotRequirements(league);
  const slots = sortSlotsByRestrictiveness(expandSlots(requirements));

  // Debug logging
  console.log('=== DEBUG: Optimal Lineup Computation ===');
  console.log('Slot requirements:', JSON.stringify(requirements, null, 2));
  console.log('Total expanded slots:', slots.length);

  // Filter to players with positive points (bench players with 0 can be ignored per spec)
  // But starters with 0 must be considered
  const availablePlayers = roster.filter((p) => {
    // Include all players that were actually started (not on bench)
    if (!BENCH_SLOTS.includes(p.rosteredPosition)) {
      return true;
    }
    // For bench players, only include if they scored > 0
    return p.totalPoints > 0;
  });

  // Sort players by points (desc) then by ID (asc) for deterministic tie-breaking
  const sortedPlayers = [...availablePlayers].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return a.id - b.id;
  });

  console.log('Available players count:', availablePlayers.length);
  console.log('Sorted players (top 5):', sortedPlayers.slice(0, 5).map(p => ({
    name: p.fullName,
    points: p.totalPoints,
    eligiblePositions: p.eligiblePositions,
    rosteredPosition: p.rosteredPosition,
  })));

  // Use backtracking to find optimal assignment
  const bestAssignment = findOptimalAssignment(sortedPlayers, slots);

  console.log('Best assignment count:', bestAssignment.length);
  console.log('Best assignment total:', bestAssignment.reduce((sum, a) => sum + a.points, 0));

  return {
    starters: bestAssignment,
    totalPoints: bestAssignment.reduce((sum, a) => sum + a.points, 0),
  };
}

/**
 * Backtracking algorithm to find optimal player-slot assignment
 */
function findOptimalAssignment(
  players: ESPNBoxscorePlayer[],
  slots: SlotRequirement[]
): PlayerSlotAssignment[] {
  const usedPlayerIds = new Set<number>();
  const assignment: PlayerSlotAssignment[] = [];

  let bestAssignment: PlayerSlotAssignment[] = [];
  let bestScore = -Infinity;

  function backtrack(slotIndex: number, currentScore: number): void {
    // Pruning: if we can't possibly beat the best score, stop
    if (slotIndex < slots.length) {
      // Calculate max possible remaining score (upper bound)
      const remainingSlots = slots.length - slotIndex;
      const unusedPlayers = players
        .filter((p) => !usedPlayerIds.has(p.id))
        .slice(0, remainingSlots);
      const maxRemaining = unusedPlayers.reduce((sum, p) => sum + p.totalPoints, 0);

      if (currentScore + maxRemaining <= bestScore) {
        return; // Prune this branch
      }
    }

    // Base case: all slots filled
    if (slotIndex === slots.length) {
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestAssignment = [...assignment];
      }
      return;
    }

    const slot = slots[slotIndex];
    let foundAny = false;

    // Try each eligible player for this slot
    for (const player of players) {
      if (usedPlayerIds.has(player.id)) continue;
      if (!isPlayerEligibleForSlot(player, slot.eligiblePositions)) continue;

      foundAny = true;
      usedPlayerIds.add(player.id);
      assignment.push({
        player,
        slot: slot.slot,
        points: player.totalPoints,
      });

      backtrack(slotIndex + 1, currentScore + player.totalPoints);

      assignment.pop();
      usedPlayerIds.delete(player.id);
    }

    // If no player found for this slot, still continue (slot stays empty)
    if (!foundAny) {
      backtrack(slotIndex + 1, currentScore);
    }
  }

  backtrack(0, 0);

  return bestAssignment;
}

/**
 * Get the actual lineup from the roster
 */
export function getActualLineup(roster: ESPNBoxscorePlayer[]): PlayerSlotAssignment[] {
  return roster
    .filter((p) => !BENCH_SLOTS.includes(p.rosteredPosition))
    .map((p) => ({
      player: p,
      slot: p.rosteredPosition,
      points: p.totalPoints,
    }));
}

/**
 * Get all slots a player is eligible to play in
 */
function getEligibleSlotsForPlayer(player: ESPNBoxscorePlayer): string[] {
  const eligibleSlots: string[] = [];

  for (const [slot, positions] of Object.entries(SLOT_ELIGIBILITY)) {
    if (isPlayerEligibleForSlot(player, positions)) {
      eligibleSlots.push(slot);
    }
  }

  return eligibleSlots;
}

/**
 * Calculate the swaps needed to improve the lineup
 *
 * For each bench player who scored points:
 * 1. Find all slots they're eligible for (e.g., RB can play RB and FLEX)
 * 2. Find the lowest-scoring starter in those slots
 * 3. If bench player scored more, that's a valid swap
 */
export function calculateSwaps(
  actualLineup: PlayerSlotAssignment[],
  optimalLineup: OptimalLineup,
  fullRoster: ESPNBoxscorePlayer[]
): LineupSwap[] {
  const swaps: LineupSwap[] = [];
  const usedSlots = new Set<string>();
  const usedStarterIds = new Set<number>();

  // Get bench players who scored points, sorted by points (highest first)
  const benchPlayers = fullRoster
    .filter(p => BENCH_SLOTS.includes(p.rosteredPosition) && p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  console.log('=== DEBUG: Swap Calculation (New Logic) ===');
  console.log('Bench players with points:', benchPlayers.map(p => ({
    name: p.fullName,
    points: p.totalPoints,
    positions: p.eligiblePositions,
  })));
  console.log('Actual lineup:', actualLineup.map(a => ({
    name: a.player.fullName,
    slot: a.slot,
    points: a.points,
  })));

  for (const benchPlayer of benchPlayers) {
    // Find slots this player is eligible for
    const eligibleSlots = getEligibleSlotsForPlayer(benchPlayer);

    console.log(`\n--- Checking bench player: ${benchPlayer.fullName} (${benchPlayer.totalPoints} pts)`);
    console.log(`  Eligible slots: ${eligibleSlots.join(', ')}`);

    // Find the lowest-scoring starter in those eligible slots
    let worstStarter: PlayerSlotAssignment | null = null;

    for (const starter of actualLineup) {
      // Skip if this slot type isn't one the bench player can play
      if (!eligibleSlots.includes(starter.slot)) {
        continue;
      }

      // Skip if we already have a swap for this slot (handles multiple FLEX slots)
      // We use a combo of slot + starter ID to allow multiple same-type slots
      const slotKey = `${starter.slot}-${starter.player.id}`;
      if (usedSlots.has(slotKey)) {
        continue;
      }

      // Skip if this starter is already being swapped out
      if (usedStarterIds.has(starter.player.id)) {
        continue;
      }

      // Skip if bench player didn't outscore this starter
      if (benchPlayer.totalPoints <= starter.points) {
        continue;
      }

      console.log(`  Considering: ${starter.player.fullName} at ${starter.slot} (${starter.points} pts)`);

      // Keep track of the worst (lowest scoring) starter we can replace
      if (worstStarter === null || starter.points < worstStarter.points) {
        worstStarter = starter;
      }
    }

    if (worstStarter) {
      const pointsGained = benchPlayer.totalPoints - worstStarter.points;
      const slotKey = `${worstStarter.slot}-${worstStarter.player.id}`;

      console.log(`  -> SWAP: Replace ${worstStarter.player.fullName} at ${worstStarter.slot} (+${pointsGained.toFixed(1)} pts)`);

      usedSlots.add(slotKey);
      usedStarterIds.add(worstStarter.player.id);

      swaps.push({
        benchPlayer: benchPlayer,
        startedPlayer: worstStarter.player,
        pointsGained,
        slot: worstStarter.slot,
      });
    } else {
      console.log(`  -> No valid swap found`);
    }
  }

  // Sort swaps by points gained (descending) for display
  swaps.sort((a, b) => {
    if (b.pointsGained !== a.pointsGained) return b.pointsGained - a.pointsGained;
    return a.benchPlayer.id - b.benchPlayer.id;
  });

  return swaps;
}
