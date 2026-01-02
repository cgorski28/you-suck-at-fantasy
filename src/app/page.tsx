'use client';

import { useState, useEffect } from 'react';
import { LeagueForm, type LeagueCredentials } from '@/components/LeagueForm';
import { TeamSelect } from '@/components/TeamSelect';
import { Report } from '@/components/Report';
import { LoadingState } from '@/components/LoadingState';
import type { LeagueData, ReportData } from '@/lib/types';

type Step = 'form' | 'select' | 'loading' | 'report';

const STORAGE_KEY = 'espn_fantasy_credentials';

interface StoredData {
  credentials: LeagueCredentials;
  leagueData: LeagueData;
}

function saveToStorage(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage might be unavailable
  }
}

function loadFromStorage(): StoredData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // localStorage might be unavailable
  }
  return null;
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // localStorage might be unavailable
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [credentials, setCredentials] = useState<LeagueCredentials | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setCredentials(stored.credentials);
      setLeagueData(stored.leagueData);
      setStep('select');
    }
    setIsHydrated(true);
  }, []);

  const handleLeagueLoaded = (data: LeagueData, creds: LeagueCredentials) => {
    setLeagueData(data);
    setCredentials(creds);
    // Save to localStorage for persistence
    saveToStorage({ credentials: creds, leagueData: data });
    setStep('select');
  };

  const handleGenerateReport = () => {
    setStep('report');
  };

  // Go back to team selection (keep credentials)
  const handleAnalyzeAnotherTeam = () => {
    setReportData(null);
    setError(null);
    setStep('select');
  };

  // Clear everything and start fresh
  const handleChangeLeague = () => {
    clearStorage();
    setStep('form');
    setLeagueData(null);
    setCredentials(null);
    setReportData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            YouSuckAtFantasyFootball
            <span className="text-green-600">.com</span>
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Show nothing until hydrated to prevent flash */}
        {!isHydrated && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}

        {/* Step: League Form */}
        {isHydrated && !isLoading && step === 'form' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Find out how bad you really are
              </h2>
              <p className="text-gray-500 mt-1">
                Enter your ESPN Fantasy Football league details below to see how many points you left on the bench and how bad you really are at fantasy football.
              </p>
            </div>
            <LeagueForm
              onLeagueLoaded={handleLeagueLoaded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
            />
          </div>
        )}

        {/* Step: Team Selection */}
        {isHydrated && !isLoading && step === 'select' && leagueData && credentials && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <TeamSelect
              leagueData={leagueData}
              credentials={credentials}
              onGenerateReport={handleGenerateReport}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
              setReportData={setReportData}
              onChangeLeague={handleChangeLeague}
            />
          </div>
        )}

        {/* Step: Report */}
        {!isLoading && step === 'report' && reportData && (
          <Report
            report={reportData}
            onAnalyzeAnotherTeam={handleAnalyzeAnotherTeam}
            onChangeLeague={handleChangeLeague}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Your league info is saved locally in your browser for convenience.
          </p>
        </div>
      </footer>
    </div>
  );
}
