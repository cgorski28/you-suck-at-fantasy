'use client';

import type { WeekResult } from '@/lib/types';
import { SLOT_DISPLAY_NAMES } from '@/lib/types';
import {
  getWeekPraiseDeterministic,
  getWeekRoastHeadline,
  getBlownWinMessage,
} from '@/lib/copy';
import { NFLTeamLogo } from './NFLTeamLogo';

function getDisplaySlotName(slot: string): string {
  return SLOT_DISPLAY_NAMES[slot] || slot;
}

// Safe number formatting to handle undefined/null values
function formatScore(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return decimals === 1 ? '0.0' : '0.00';
  }
  return value.toFixed(decimals);
}

interface WeeklySectionProps {
  week: WeekResult;
}

export function WeeklySection({ week }: WeeklySectionProps) {
  const isPerfect = week.pointsMissed === 0;
  const isWin = week.won;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Week Header Bar */}
      <div
        className={`px-4 py-2 flex items-center justify-between ${
          isWin ? 'bg-green-600' : 'bg-gray-800'
        }`}
      >
        <span className="font-bold text-white">Week {week.week}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            isWin
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {isWin ? 'WIN' : 'LOSS'}
        </span>
      </div>

      {/* Box Score Style Matchup */}
      <div className="grid grid-cols-2 border-b border-gray-100">
        {/* Your Team */}
        <div
          className={`p-4 flex flex-col items-center justify-end border-r border-gray-100 ${
            isWin ? 'bg-green-50' : 'bg-gray-50'
          }`}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            You
          </p>
          <p
            className={`text-3xl font-bold ${
              isWin ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            {formatScore(week.actualScore)}
          </p>
        </div>

        {/* Opponent */}
        <div
          className={`p-4 flex flex-col items-center justify-end ${
            !isWin ? 'bg-red-50' : 'bg-gray-50'
          }`}
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 text-center">
            {week.opponentName}
          </p>
          <p
            className={`text-3xl font-bold ${
              !isWin ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatScore(week.opponentScore)}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Optimal
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatScore(week.optimalScore)}
          </p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Left on Bench
          </p>
          <p
            className={`text-lg font-bold ${
              isPerfect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPerfect ? '0.00' : `-${formatScore(week.pointsMissed, 2)}`}
          </p>
        </div>
      </div>

      {/* Commentary Section */}
      <div className="px-4 py-4">
        {isPerfect ? (
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <p className="text-sm text-green-700 font-medium">
              {getWeekPraiseDeterministic(week.week)}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Roast Headline */}
            <p className="text-sm font-semibold text-gray-800">
              {getWeekRoastHeadline(week.pointsMissed, week.week)}
            </p>

            {/* Blown Win Alert */}
            {week.isBlownWin && (
              <div className="bg-red-50 border-l-4 border-red-500 px-3 py-2 rounded-r">
                <p className="text-sm text-red-700 font-medium">
                  💀 {getBlownWinMessage(week.blownWinMargin, week.week)}
                </p>
              </div>
            )}

            {/* Swaps Section */}
            {week.swaps.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  What You Should Have Done
                </p>
                <div className="space-y-2">
                  {week.swaps.map((swap, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      {/* Header row: Position and Points */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {getDisplaySlotName(swap.slot)}
                        </span>
                        <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded">
                          +{formatScore(swap.pointsGained)} pts
                        </span>
                      </div>

                      {/* Start this player */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600 text-sm">→</span>
                        <span className="text-sm text-gray-600">Start</span>
                        <span className="font-semibold text-sm text-gray-900">
                          {swap.benchPlayer.fullName}
                        </span>
                        <NFLTeamLogo
                          teamAbbreviation={swap.benchPlayer.proTeamAbbreviation}
                          size={32}
                        />

                      </div>

                      {/* Instead of this player */}
                      <div className="flex items-center gap-2 pl-5">
                        <span className="text-sm text-gray-400">instead of</span>
                        <span className="text-sm text-gray-500">
                          {swap.startedPlayer.fullName}
                        </span>
                        <NFLTeamLogo
                          teamAbbreviation={swap.startedPlayer.proTeamAbbreviation}
                          size={32}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
