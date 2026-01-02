import type { ReportData, WeekResult } from './types';

/**
 * Roast copy generator
 * All playful/humorous text comes from this module
 *
 * Uses deterministic "randomness" based on team data for variety
 */

// Simple hash function for deterministic variety
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pickOne<T>(options: T[], seed: number): T {
  return options[seed % options.length];
}

export function getVerdict(report: ReportData): string {
  const pointsPerGame = report.totalPointsLeftOnBench / report.weeks.length;
  const totalGames = report.regularSeasonWins + report.regularSeasonLosses;
  const winPct = totalGames > 0 ? report.regularSeasonWins / totalGames : 0;
  const hash = hashString(report.teamName + report.seasonId);

  // Champion with blown wins - ironic
  if (report.finalStandingsPosition === 1 && report.blownWins > 0) {
    return pickOne([
      "Final verdict: You won the league despite your best efforts to lose it.",
      "Final verdict: Champion by luck, not by skill.",
      "Final verdict: You stumbled into a championship. Congrats, I guess.",
    ], hash);
  }

  // Champion with good management
  if (report.finalStandingsPosition === 1 && report.totalPointsLeftOnBench < 50) {
    return pickOne([
      "Final verdict: Annoyingly competent. You actually deserved this one.",
      "Final verdict: A well-managed championship run. How boring.",
      "Final verdict: You did everything right. There's nothing to roast here. Disgusting.",
    ], hash);
  }

  // Champion
  if (report.finalStandingsPosition === 1) {
    return pickOne([
      "Final verdict: You won, but let's talk about how messy that journey was.",
      "Final verdict: Champion, but your bench management needs work.",
    ], hash);
  }

  // Last place
  if (report.finalStandingsPosition === report.leagueSize) {
    return pickOne([
      "Final verdict: Dead last. At least you're consistent.",
      "Final verdict: Someone had to finish last. Congrats, it was you.",
      "Final verdict: The toilet bowl is yours. Wear it proudly.",
      "Final verdict: You didn't just lose, you committed to losing.",
    ], hash);
  }

  // Many blown wins (3+)
  if (report.blownWins >= 3) {
    return pickOne([
      "Final verdict: You didn't just lose games, you donated them.",
      `Final verdict: ${report.blownWins} blown wins. That's a talent, honestly.`,
      "Final verdict: Your lineup decisions were an act of self-sabotage.",
      "Final verdict: You're not unlucky. You're just bad at this.",
    ], hash);
  }

  // High points left on bench (scale based on games played)
  if (pointsPerGame > 15) {
    return pickOne([
      "Final verdict: Your bench was a fantasy team unto itself.",
      "Final verdict: You left a whole roster's worth of points sitting there.",
      `Final verdict: ${pointsPerGame.toFixed(1)} points per week on your bench. Impressive incompetence.`,
      "Final verdict: You are impressively bad at fantasy football.",
    ], hash);
  }

  if (pointsPerGame > 10) {
    return pickOne([
      "Final verdict: Your bench outscored some people's starters.",
      "Final verdict: You are bad at fantasy football. The numbers don't lie.",
      "Final verdict: Double-digit points per week left on the bench. Classic.",
    ], hash);
  }

  // Lost season with blown wins
  if (winPct < 0.4 && report.blownWins >= 2) {
    return pickOne([
      "Final verdict: Your record could have been respectable. But here we are.",
      `Final verdict: ${report.blownWins} wins you threw away. That's the difference between bad and tragic.`,
      "Final verdict: You weren't just unlucky. You actively sabotaged yourself.",
    ], hash);
  }

  // Two blown wins
  if (report.blownWins === 2) {
    return pickOne([
      "Final verdict: Two wins walked right out the door because of you.",
      "Final verdict: Imagine your season with two more wins. Now stop imagining.",
      "Final verdict: Two games. You blew two games. Let that marinate.",
    ], hash);
  }

  // One blown win
  if (report.blownWins === 1) {
    return pickOne([
      "Final verdict: One win. You threw away one win. That's on you.",
      "Final verdict: A single blown win. It happens. But it happened to you.",
      "Final verdict: One game you should have won. One game you didn't.",
    ], hash);
  }

  // Good record but sloppy
  if (winPct >= 0.6 && pointsPerGame > 8) {
    return pickOne([
      "Final verdict: You won games despite your lineup decisions, not because of them.",
      "Final verdict: A winning record built on luck and vibes.",
      "Final verdict: Solid record, sloppy execution. You got away with it.",
    ], hash);
  }

  // Good record, good management
  if (winPct >= 0.6 && pointsPerGame < 5) {
    return pickOne([
      "Final verdict: Competent. Boring, but competent.",
      "Final verdict: Not much to roast here. Try being worse next year.",
      "Final verdict: You actually know what you're doing. Annoying.",
    ], hash);
  }

  // Moderate points left
  if (pointsPerGame > 5) {
    return pickOne([
      "Final verdict: Room for improvement. Lots of room.",
      "Final verdict: Mediocre lineup management from a mediocre manager.",
      "Final verdict: Not a disaster, but nothing to brag about either.",
      "Final verdict: You could be better. You should be better.",
    ], hash);
  }

  // Low points left
  if (pointsPerGame <= 5) {
    return pickOne([
      "Final verdict: Surprisingly competent. We're almost disappointed.",
      "Final verdict: Not much to criticize. How unsatisfying.",
      "Final verdict: You actually managed your lineup well. Boring.",
      "Final verdict: Solid management. Where's the fun in that?",
    ], hash);
  }

  return "Final verdict: An average season from an average manager.";
}

export function getBenchPointsSummary(totalPoints: number, report: ReportData): string {
  const hash = hashString(report.teamName);
  const pointsPerGame = totalPoints / report.weeks.length;

  if (pointsPerGame > 15) {
    return pickOne([
      "That's not a bench, that's a graveyard of missed opportunities.",
      "Your bench was basically a second starting lineup.",
      "Those points were begging to play. You ignored them.",
    ], hash);
  }
  if (pointsPerGame > 10) {
    return pickOne([
      "Double digits per week just sitting there. Painful.",
      "That's a lot of points collecting dust on your bench.",
      "Your bench players deserved better than you.",
    ], hash);
  }
  if (pointsPerGame > 6) {
    return pickOne([
      "Not catastrophic, but those points add up over a season.",
      "A few better decisions and this number shrinks significantly.",
      "Every week, a little bit of value slipping away.",
    ], hash);
  }
  if (pointsPerGame > 3) {
    return pickOne([
      "Some missed opportunities, but nothing too egregious.",
      "Room for improvement, but you weren't asleep at the wheel.",
      "A respectable amount of regret. Not too much, not too little.",
    ], hash);
  }
  return pickOne([
    "Your bench management was actually solid. Weird.",
    "Minimal points left behind. Well done, I suppose.",
    "Not much to criticize here. How disappointing for us.",
  ], hash);
}

export function getBlownWinsSummary(blownWins: number, report: ReportData): string {
  const hash = hashString(report.teamName);

  if (blownWins === 0) {
    return pickOne([
      "At least your losses were legitimate.",
      "No games thrown away. A small consolation.",
      "You lost fair and square. No excuses here.",
    ], hash);
  }
  if (blownWins === 1) {
    return pickOne([
      "One game you could have won. One game you threw away.",
      "A single win slipped through your fingers.",
      "One blown win. It stings, doesn't it?",
    ], hash);
  }
  if (blownWins === 2) {
    return pickOne([
      "Two games. You lost two games you should have won.",
      "A pair of wins, donated to your opponents.",
      "Two blown wins. That's a pattern, not a fluke.",
    ], hash);
  }
  if (blownWins === 3) {
    return pickOne([
      "Three wins you gave away. That's impressive in the worst way.",
      "A hat trick of failure. Three blown wins.",
      "Three games lost to poor lineup decisions. Ouch.",
    ], hash);
  }
  return pickOne([
    `${blownWins} games lost due to your own decisions. Remarkable.`,
    `${blownWins} blown wins. At this point, it's a lifestyle choice.`,
    `${blownWins} wins thrown away. Were you even trying?`,
  ], hash);
}

export function getWeekPraiseDeterministic(week: number): string {
  const options = [
    'Shockingly competent this week.',
    'No points left on the bench. A rare achievement.',
    'Perfect lineup. Mark your calendar.',
    'You actually set the optimal lineup. Impressive.',
    'Nothing to roast here. Enjoy this moment.',
    'Optimal decisions all around. Who are you?',
    'Zero points missed. Did someone else set your lineup?',
    'A flawless week. Treasure it.',
  ];
  return options[week % options.length];
}

export function getWeekRoastHeadline(pointsMissed: number, week: number): string {
  const hash = week;

  if (pointsMissed > 40) {
    return pickOne([
      `Did you even check your lineup this week?`,
      `This is the kind of mismanagement that loses championships.`,
      `Your bench players are begging for playing time.`,
    ], hash);
  }
  if (pointsMissed > 25) {
    return pickOne([
      `That's a lot of wasted potential sitting on your bench.`,
      `Your lineup decisions need some serious work.`,
      `Those bench points could have changed everything.`,
    ], hash);
  }
  if (pointsMissed > 15) {
    return pickOne([
      `Not your finest lineup management work.`,
      `A few better decisions and this looks different.`,
      `Your bench was quietly outperforming your starters.`,
    ], hash);
  }
  if (pointsMissed > 8) {
    return pickOne([
      `Room for improvement in the lineup department.`,
      `A modest oversight, but oversights add up.`,
    ], hash);
  }
  return `Minor, but every point counts in fantasy.`;
}

export function getBlownWinMessage(margin: number, week: number): string {
  const hash = week;

  if (margin > 30) {
    return pickOne([
      `You could have won by ${margin.toFixed(2)} points. Instead, you lost. Spectacular failure.`,
      `A ${margin.toFixed(2)} point win, thrown in the trash.`,
    ], hash);
  }
  if (margin > 15) {
    return pickOne([
      `You could have won by ${margin.toFixed(2)} points. But you didn't.`,
      `${margin.toFixed(2)} points was your margin for victory. You blew it.`,
    ], hash);
  }
  if (margin > 5) {
    return pickOne([
      `You could have won by ${margin.toFixed(2)} points.`,
      `A comfortable ${margin.toFixed(2)} point win was right there.`,
    ], hash);
  }
  return `You could have squeaked out a ${margin.toFixed(2)} point win.`;
}

export function getLoadingMessages(): string[] {
  return [
    'Analyzing your poor decisions…',
    'Reviewing every start/sit mistake…',
    'Calculating your incompetence…',
    'Tallying up your regrets…',
    'Measuring the depths of your failure…',
  ];
}

export function formatRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function getSeasonSummary(report: ReportData): string {
  const totalGames = report.regularSeasonWins + report.regularSeasonLosses;
  const winPct = totalGames > 0 ? report.regularSeasonWins / totalGames : 0;
  const pointsPerGame = report.totalPointsLeftOnBench / report.weeks.length;
  const hash = hashString(report.teamName + report.seasonId);

  // Champion scenarios
  if (report.finalStandingsPosition === 1) {
    if (report.blownWins >= 2) {
      return pickOne([
        "A championship won on vibes and luck alone.",
        "You stumbled to a title. The trophy doesn't know the difference.",
      ], hash);
    }
    if (pointsPerGame > 10) {
      return pickOne([
        "Champion despite the chaos. Your opponents were worse.",
        "A title won in spite of your lineup decisions.",
      ], hash);
    }
    return pickOne([
      "A well-earned championship. Boring, but respectable.",
      "You managed your way to a title. Well done.",
    ], hash);
  }

  // Last place
  if (report.finalStandingsPosition === report.leagueSize) {
    if (report.blownWins >= 2) {
      return pickOne([
        "Last place, and it didn't have to be this way.",
        "The basement, courtesy of your own decisions.",
      ], hash);
    }
    return pickOne([
      "A rough season from start to finish.",
      "Some seasons are just cursed. This was one of them.",
    ], hash);
  }

  // Playoff team with issues
  if (report.finalStandingsPosition && report.finalStandingsPosition <= 6) {
    if (report.blownWins >= 2) {
      return pickOne([
        "Made the playoffs despite your best efforts otherwise.",
        "A playoff team with a lot of self-inflicted wounds.",
      ], hash);
    }
    if (pointsPerGame > 10) {
      return pickOne([
        "Playoff-caliber record, bench-rider-caliber management.",
        "You made the playoffs. Your lineup decisions almost stopped you.",
      ], hash);
    }
    return pickOne([
      "A solid playoff push. Could have gone further with cleaner play.",
      "Playoff team. Not bad, not great.",
    ], hash);
  }

  // Good record but missed playoffs or mid-tier
  if (winPct >= 0.5) {
    if (report.blownWins >= 2) {
      return pickOne([
        "A winning record, but imagine what could have been.",
        "Above .500, but those blown wins will haunt you.",
      ], hash);
    }
    return pickOne([
      "A respectable season with room to grow.",
      "Not embarrassing, but not impressive either.",
    ], hash);
  }

  // Losing record
  if (report.blownWins >= 2) {
    return pickOne([
      "A losing season made worse by your own choices.",
      "Below .500, and you have yourself to blame for some of it.",
    ], hash);
  }

  return pickOne([
    "A forgettable season. Better luck next year.",
    "Not your year. The numbers confirm it.",
    "A season best left in the past.",
  ], hash);
}
