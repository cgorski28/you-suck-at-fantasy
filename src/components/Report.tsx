'use client';

import type { ReportData, WeekResult } from '@/lib/types';
import {
  getVerdict,
  getBenchPointsSummary,
  getBlownWinsSummary,
  formatRecord,
  getSeasonSummary,
} from '@/lib/copy';
import { WeeklySection } from './WeeklySection';

interface ReportProps {
  report: ReportData;
  onAnalyzeAnotherTeam: () => void;
  onChangeLeague: () => void;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function Report({ report, onAnalyzeAnotherTeam, onChangeLeague }: ReportProps) {
  const verdict = getVerdict(report);
  const benchSummary = getBenchPointsSummary(report.totalPointsLeftOnBench, report);
  const blownWinsSummary = getBlownWinsSummary(report.blownWins, report);
  const seasonSummary = getSeasonSummary(report);

  // Split weeks into regular season and playoffs
  const regularSeasonWeeks = report.weeks.filter((w) => !w.isPlayoffs);
  const playoffWeeks = report.weeks.filter((w) => w.isPlayoffs);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header / Synopsis - Screenshot friendly */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Team Header */}
        <div className="bg-gray-900 text-white px-6 py-5">
          {/* Mobile: stacked layout, Desktop: side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Team Info */}
            <div className="flex items-center gap-4">
              {report.teamLogoURL && (
                <img
                  src={report.teamLogoURL}
                  alt={`${report.teamName} logo`}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">{report.teamName}</h1>
                <p className="text-gray-400 text-sm">{report.ownerName}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 sm:gap-4">
              <div>
                <p className="text-3xl sm:text-2xl font-bold">
                  {formatRecord(report.regularSeasonWins, report.regularSeasonLosses)}
                </p>
                <p className="text-xs text-gray-400">Record</p>
              </div>
              {report.finalStandingsPosition && (
                <div className="border-l border-gray-700 pl-6 sm:pl-4">
                  <p className="text-3xl sm:text-2xl font-bold">
                    {getOrdinal(report.finalStandingsPosition)}
                  </p>
                  <p className="text-xs text-gray-400">of {report.leagueSize} teams</p>
                </div>
              )}
            </div>
          </div>

          {/* League info - subtle footer */}
          <p className="text-gray-500 text-xs mt-4 pt-3 border-t border-gray-800">
            {report.leagueName} • {report.seasonId} Season
          </p>
        </div>

        {/* Verdict */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {verdict}
          </h2>
          <p className="text-gray-500 mt-2">{seasonSummary}</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div className="px-6 py-5">
            <p className="text-3xl font-bold text-red-600">
              {report.totalPointsLeftOnBench.toFixed(2)}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              Points Left on Bench
            </p>
            <p className="text-xs text-gray-500 mt-1">{benchSummary}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-3xl font-bold text-red-600">{report.blownWins}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              Blown Win{report.blownWins !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">{blownWinsSummary}</p>
          </div>
        </div>
      </div>

      {/* Regular Season Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 px-1">
          Regular Season
        </h3>

        {regularSeasonWeeks.map((week) => (
          <WeeklySection key={week.week} week={week} />
        ))}
      </div>

      {/* Playoffs Breakdown */}
      {playoffWeeks.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-3 px-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Playoffs
            </h3>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
              {report.playoffWins}-{report.playoffLosses}
            </span>
          </div>

          {playoffWeeks.map((week) => (
            <WeeklySection key={week.week} week={week} />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 mb-12 space-y-3">
        <button
          onClick={onAnalyzeAnotherTeam}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          Analyze Another Team
        </button>
        <button
          onClick={onChangeLeague}
          className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Change League
        </button>
      </div>
    </div>
  );
}
