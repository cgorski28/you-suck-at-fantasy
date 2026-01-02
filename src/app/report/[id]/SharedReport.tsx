'use client';

import type { ReportData } from '@/lib/types';
import {
  getVerdict,
  getBenchPointsSummary,
  getBlownWinsSummary,
  formatRecord,
  getSeasonSummary,
} from '@/lib/copy';
import { WeeklySection } from '@/components/WeeklySection';
import Link from 'next/link';

interface SharedReportProps {
  report: ReportData;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function SharedReport({ report }: SharedReportProps) {
  const verdict = getVerdict(report);
  const benchSummary = getBenchPointsSummary(report.totalPointsLeftOnBench, report);
  const blownWinsSummary = getBlownWinsSummary(report.blownWins, report);
  const seasonSummary = getSeasonSummary(report);

  const regularSeasonWeeks = report.weeks.filter((w) => !w.isPlayoffs);
  const playoffWeeks = report.weeks.filter((w) => w.isPlayoffs);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              YouSuckAtFantasyFootball<span className="text-red-600">.com</span>
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="max-w-2xl mx-auto">
          {/* Header / Synopsis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Team Header */}
            <div className="bg-gray-900 text-white px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

              <p className="text-gray-500 text-xs mt-4 pt-3 border-t border-gray-800">
                {report.leagueName} - {report.seasonId} Season
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

          {/* CTA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-3">Think you can do better?</p>
            <Link
              href="/"
              className="block w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Generate Your Own Report
            </Link>
          </div>

          {/* Regular Season Breakdown */}
          <div className="space-y-4 mt-6">
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

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            We are not responsible for your hurt feelings.
          </p>
        </div>
      </footer>
    </div>
  );
}
