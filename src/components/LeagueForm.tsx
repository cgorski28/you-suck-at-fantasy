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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 text-sm"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !leagueId}
        className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          <>
            Get Roasted
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
