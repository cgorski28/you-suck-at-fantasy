'use client';

import { useState, useEffect } from 'react';
import { LeagueForm, type LeagueCredentials } from '@/components/LeagueForm';
import { TeamSelect } from '@/components/TeamSelect';
import { Report } from '@/components/Report';
import { LoadingState } from '@/components/LoadingState';
import type { LeagueData, ReportResponse } from '@/lib/types';

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

// Sample preview card component
function SampleRoastCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-sm">
      {/* Week Header */}
      <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
        <span className="font-bold text-white text-sm">Week 7 Recap</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-800 text-red-100">
          GRADE: F
        </span>
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">&ldquo;</span>
          <p className="text-sm text-gray-700 italic">
            Benching your WR1 for a &apos;sleeper&apos; who put up 2.4 points? Bold strategy! The analytics suggest you should stop listening to podcasts.
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">Points left on bench:</span>
          <span className="font-bold text-red-600">-24.7 pts</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [credentials, setCredentials] = useState<LeagueCredentials | null>(null);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
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

  // Landing page with hero section
  const renderLandingPage = () => (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            YouSuckAtFantasyFootball<span className="text-red-600">.com</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Welcome to{' '}
                <span className="text-red-600">Rock Bottom.</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Connect your ESPN league. We&apos;ll use advanced algorithms to explain exactly why you lost last week{' '}
                <span className="text-gray-500">(spoiler: it was your fault).</span>
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Calculate your true optimal lineup every week</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">See exactly how many points you left on your bench</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Discover which wins you completely blew</span>
              </div>
            </div>

            {/* Desktop-only notice */}
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Requires desktop &mdash; you&apos;ll need browser dev tools to get your ESPN credentials
            </p>

            {/* Sample Preview Card - hidden on small screens, shown on lg+ */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-200 to-red-100 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <SampleRoastCard />
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:pl-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Something went wrong</p>
                  <p className="text-sm text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Show nothing until hydrated to prevent flash */}
            {!isHydrated && !isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}

            {isHydrated && !isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    Find out how bad you really are at fantasy football
                  </h3>
                  <p className="text-gray-500 mt-1 text-sm">
                    Enter your ESPN Fantasy Football league details to get your report.
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

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <LoadingState />
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              We are not responsible for your hurt feelings.
            </p>
            <p className="text-xs text-gray-400">
              Your league info is saved locally in your browser.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Team selection page
  const renderTeamSelectPage = () => (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-red-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            YouSuckAtFantasyFootball<span className="text-red-600">.com</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <LoadingState />
          </div>
        ) : leagueData && credentials && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
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
      </main>

      <footer className="border-t border-gray-200 bg-white/50 mt-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            We are not responsible for your hurt feelings.
          </p>
        </div>
      </footer>
    </div>
  );

  // Report page
  const renderReportPage = () => (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              YouSuckAtFantasyFootball<span className="text-red-600">.com</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeAnotherTeam}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Change Team
            </button>
            <button
              onClick={handleChangeLeague}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Change League
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        {reportData && (
          <Report
            report={reportData}
            shareId={reportData.shareId}
            onAnalyzeAnotherTeam={handleAnalyzeAnotherTeam}
            onChangeLeague={handleChangeLeague}
          />
        )}
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

  // Render based on step
  if (step === 'form') {
    return renderLandingPage();
  }

  if (step === 'select') {
    return renderTeamSelectPage();
  }

  if (step === 'report' || step === 'loading') {
    return renderReportPage();
  }

  return renderLandingPage();
}
