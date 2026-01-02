import type {
  ESPNBoxscorePlayer,
  ESPNLeague,
  OptimalLineup,
  PlayerSlotAssignment,
  LineupSwap,
  LineupSwapV2,
  SimpleSwap,
  ChainSwap,
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

  // Use backtracking to find optimal assignment
  const bestAssignment = findOptimalAssignment(sortedPlayers, slots);

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

  for (const benchPlayer of benchPlayers) {
    // Find slots this player is eligible for
    const eligibleSlots = getEligibleSlotsForPlayer(benchPlayer);

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

      // Keep track of the worst (lowest scoring) starter we can replace
      if (worstStarter === null || starter.points < worstStarter.points) {
        worstStarter = starter;
      }
    }

    if (worstStarter) {
      const pointsGained = benchPlayer.totalPoints - worstStarter.points;
      const slotKey = `${worstStarter.slot}-${worstStarter.player.id}`;

      usedSlots.add(slotKey);
      usedStarterIds.add(worstStarter.player.id);

      swaps.push({
        benchPlayer: benchPlayer,
        startedPlayer: worstStarter.player,
        pointsGained,
        slot: worstStarter.slot,
      });
    }
  }

  // Sort swaps by points gained (descending) for display
  swaps.sort((a, b) => {
    if (b.pointsGained !== a.pointsGained) return b.pointsGained - a.pointsGained;
    return a.benchPlayer.id - b.benchPlayer.id;
  });

  return swaps;
}

/**
 * Build swap chains by comparing actual lineup to optimal lineup
 *
 * This approach correctly handles chain swaps where:
 * 1. A bench player takes a slot
 * 2. That displaces someone who moves to another slot
 * 3. Which may displace someone else, and so on...
 * 4. Until finally someone goes to bench
 *
 * Example 3-step chain:
 * Vidal (Bench) → RB ← Charbonnet → FLEX ← Jeudy → WR ← St. Brown (Bench)
 */
export function buildSwapChains(
  actualLineup: PlayerSlotAssignment[],
  optimalLineup: OptimalLineup,
  fullRoster: ESPNBoxscorePlayer[]
): LineupSwapV2[] {
  // Step 1: Build maps of player ID -> slot for actual and optimal
  const actualSlotMap = new Map<number, string>();
  for (const assignment of actualLineup) {
    actualSlotMap.set(assignment.player.id, assignment.slot);
  }

  const optimalSlotMap = new Map<number, string>();
  for (const assignment of optimalLineup.starters) {
    optimalSlotMap.set(assignment.player.id, assignment.slot);
  }

  // Step 2: Categorize all player changes
  interface PlayerChange {
    player: ESPNBoxscorePlayer;
    actualSlot: string;
    optimalSlot: string;
  }

  const benchToStarter: PlayerChange[] = [];
  const starterToBench: PlayerChange[] = [];
  const slotChanges: PlayerChange[] = [];

  for (const player of fullRoster) {
    const actualSlot = actualSlotMap.get(player.id) ?? 'Bench';
    const optimalSlot = optimalSlotMap.get(player.id) ?? 'Bench';

    const isActualBench = actualSlot === 'Bench' || BENCH_SLOTS.includes(actualSlot);
    const isOptimalBench = optimalSlot === 'Bench' || BENCH_SLOTS.includes(optimalSlot);

    if (isActualBench && !isOptimalBench) {
      benchToStarter.push({ player, actualSlot: 'Bench', optimalSlot });
    } else if (!isActualBench && isOptimalBench) {
      starterToBench.push({ player, actualSlot, optimalSlot: 'Bench' });
    } else if (!isActualBench && !isOptimalBench && actualSlot !== optimalSlot) {
      slotChanges.push({ player, actualSlot, optimalSlot });
    }
  }

  // Helper function to trace a chain from a starting slot to someone who goes to bench
  // Returns the full chain of slot changes and the final benched player
  function traceChainToEnd(
    startSlot: string,
    usedSlotChanges: Set<number>,
    usedStarterToBench: Set<number>
  ): { chain: PlayerChange[], benchedPlayer: PlayerChange | null } {
    const chain: PlayerChange[] = [];
    let currentSlot = startSlot;
    const maxDepth = 10; // Prevent infinite loops

    for (let depth = 0; depth < maxDepth; depth++) {
      // First, check if there's a starterToBench at currentSlot
      const benchedPlayer = starterToBench.find(
        stb => stb.actualSlot === currentSlot && !usedStarterToBench.has(stb.player.id)
      );
      if (benchedPlayer) {
        return { chain, benchedPlayer };
      }

      // If not, look for a slotChange that vacated currentSlot
      const slotChange = slotChanges.find(
        sc => sc.actualSlot === currentSlot && !usedSlotChanges.has(sc.player.id)
      );
      if (slotChange) {
        chain.push(slotChange);
        usedSlotChanges.add(slotChange.player.id);
        currentSlot = slotChange.optimalSlot;
      } else {
        // Dead end - no slotChange and no starterToBench at this slot
        return { chain, benchedPlayer: null };
      }
    }

    return { chain, benchedPlayer: null };
  }

  // Step 3: Build chains for each benchToStarter
  const swaps: LineupSwapV2[] = [];
  const usedSlotChanges = new Set<number>();
  const usedStarterToBench = new Set<number>();

  // Sort benchToStarter by points descending for deterministic processing
  benchToStarter.sort((a, b) => b.player.totalPoints - a.player.totalPoints);

  for (const bts of benchToStarter) {
    const targetSlot = bts.optimalSlot;

    // Trace the full chain from targetSlot to someone who goes to bench
    const { chain, benchedPlayer } = traceChainToEnd(targetSlot, usedSlotChanges, usedStarterToBench);

    if (benchedPlayer) {
      usedStarterToBench.add(benchedPlayer.player.id);
      const pointsGained = bts.player.totalPoints - benchedPlayer.player.totalPoints;

      if (chain.length > 0) {
        // Chain swap: there were intermediate moves
        // But first, check if we can simplify: if the bench player is eligible for the
        // benched player's original slot, we can show it as a simple swap instead.
        // This is more intuitive: "Start Vidal in FLEX instead of Charbonnet" vs
        // "Move Kamara RB→FLEX (replaces Charbonnet), Start Vidal in RB"
        const benchedPlayerOriginalSlot = benchedPlayer.actualSlot;
        const benchPlayerEligibleForBenchedSlot = isPlayerEligibleForSlot(
          bts.player,
          SLOT_ELIGIBILITY[benchedPlayerOriginalSlot] || [benchedPlayerOriginalSlot]
        );

        if (benchPlayerEligibleForBenchedSlot) {
          // Simplify to a direct swap - the chain is just internal rearrangement
          const simpleSwap: SimpleSwap = {
            type: 'simple',
            benchPlayer: bts.player,
            benchedPlayer: benchedPlayer.player,
            slot: benchedPlayerOriginalSlot,
            pointsGained,
          };

          swaps.push(simpleSwap);
        } else {
          // True chain swap: bench player can't directly take the benched player's slot
          // For display, show the LAST intermediate move (the one that directly displaces the benched player)
          const lastMove = chain[chain.length - 1];

          const chainSwap: ChainSwap = {
            type: 'chain',
            benchPlayer: bts.player,
            targetSlot: lastMove.actualSlot,  // Use the slot that the last move vacates
            intermediateMove: {
              player: lastMove.player,
              fromSlot: lastMove.actualSlot,
              toSlot: lastMove.optimalSlot,
            },
            benchedPlayer: benchedPlayer.player,
            pointsGained,
          };

          swaps.push(chainSwap);
        }
      } else {
        // Simple swap: bench player directly replaces someone who went to bench
        const simpleSwap: SimpleSwap = {
          type: 'simple',
          benchPlayer: bts.player,
          benchedPlayer: benchedPlayer.player,
          slot: targetSlot,
          pointsGained,
        };

        swaps.push(simpleSwap);
      }
    }
  }

  // Filter out swaps with 0 or negative points gained (no actual improvement)
  const meaningfulSwaps = swaps.filter(swap => swap.pointsGained > 0);

  // Sort by points gained descending
  meaningfulSwaps.sort((a, b) => {
    if (b.pointsGained !== a.pointsGained) return b.pointsGained - a.pointsGained;
    return a.benchPlayer.id - b.benchPlayer.id;
  });

  return meaningfulSwaps;
}
