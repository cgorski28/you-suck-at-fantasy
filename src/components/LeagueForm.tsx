'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LeagueData, TeamInfo } from '@/lib/types';

interface LeagueFormProps {
  onLeagueLoaded: (data: LeagueData, credentials: LeagueCredentials) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface LeagueCredentials {
  leagueId: string;
  seasonId: string;
  espnS2: string;
  SWID: string;
}

export function LeagueForm({
  onLeagueLoaded,
  isLoading,
  setIsLoading,
  setError,
}: LeagueFormProps) {
  const [leagueId, setLeagueId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [espnS2, setEspnS2] = useState('');
  const [swid, setSwid] = useState('');
  const [showPrivateFields, setShowPrivateFields] = useState(false);

  const currentYear = 2025

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/league', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          seasonId: seasonId || currentYear,
          espnS2: espnS2 || undefined,
          SWID: swid || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load league');
      }

      const data: LeagueData = await response.json();
      onLeagueLoaded(data, {
        leagueId,
        seasonId: seasonId || String(currentYear),
        espnS2,
        SWID: swid,
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="leagueId"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          League ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="leagueId"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
          placeholder="e.g., 12345678"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">
          Find this in your ESPN league URL: espn.com/football/league?leagueId=
          <strong>XXXXXXXX</strong>
        </p>
      </div>

      <div>
        <label
          htmlFor="seasonId"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Season Year
        </label>
        <input
          type="text"
          id="seasonId"
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
          placeholder={`Default: ${currentYear}`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowPrivateFields(!showPrivateFields)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          {showPrivateFields ? '▼' : '▶'} Private League? Add ESPN Cookies
        </button>

        {showPrivateFields && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-3">
              For private leagues, you need to provide your ESPN cookies.{' '}
              <Link
                href="/instructions"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                How do I find these?
              </Link>
            </p>

            <div>
              <label
                htmlFor="espnS2"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                espn_s2
              </label>
              <input
                type="text"
                id="espnS2"
                value={espnS2}
                onChange={(e) => setEspnS2(e.target.value)}
                placeholder="Your espn_s2 cookie value"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="swid"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                SWID
              </label>
              <input
                type="text"
                id="swid"
                value={swid}
                onChange={(e) => setSwid(e.target.value)}
                placeholder="Your SWID cookie value (includes curly braces)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !leagueId}
        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {isLoading ? 'Loading...' : 'Load League'}
      </button>
    </form>
  );
}
