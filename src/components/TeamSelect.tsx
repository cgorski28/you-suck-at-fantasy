'use client';

import { useState } from 'react';
import type { LeagueData, ReportData } from '@/lib/types';
import type { LeagueCredentials } from './LeagueForm';

interface TeamSelectProps {
  leagueData: LeagueData;
  credentials: LeagueCredentials;
  onGenerateReport: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setReportData: (data: ReportData | null) => void;
  onChangeLeague: () => void;
}

export function TeamSelect({
  leagueData,
  credentials,
  onGenerateReport,
  isLoading,
  setIsLoading,
  setError,
  setReportData,
  onChangeLeague,
}: TeamSelectProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const handleGenerate = async () => {
    if (!selectedTeamId) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: credentials.leagueId,
          seasonId: credentials.seasonId,
          espnS2: credentials.espnS2 || undefined,
          SWID: credentials.SWID || undefined,
          teamId: selectedTeamId,
          totalWeeks: leagueData.totalWeeks,
          playoffStartWeek: leagueData.playoffStartWeek,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
      onGenerateReport();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {leagueData.leagueName}
        </h2>
        <p className="text-sm text-gray-500">
          {leagueData.seasonId} Season • {leagueData.teams.length} Teams •{' '}
          {leagueData.totalWeeks} Weeks
        </p>
      </div>

      <div>
        <label
          htmlFor="team"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Select Your Team
        </label>
        <select
          id="team"
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
        >
          <option value="">Choose a team...</option>
          {leagueData.teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.ownerName})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onChangeLeague}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Change League
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !selectedTeamId}
          className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
}
