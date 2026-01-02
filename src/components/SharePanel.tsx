'use client';

import { useState } from 'react';
import type { ReportData } from '@/lib/types';

interface SharePanelProps {
  report: ReportData;
  shareId: string;
}

function getShareText(report: ReportData): string {
  const options = [
    `I left ${report.totalPointsLeftOnBench.toFixed(1)} points on the bench this season. Roast me.`,
    `Exposed: ${report.totalPointsLeftOnBench.toFixed(1)} points rotting on my bench in ${report.seasonId}`,
    `${report.teamName} was a disaster. See for yourself.`,
  ];
  // Deterministic selection based on team name
  const hash = report.teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return options[hash % options.length];
}

export function SharePanel({ report, shareId }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/report/${shareId}`
    : `/report/${shareId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText(report));
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(`/api/og/${shareId}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.teamName.replace(/\s+/g, '-').toLowerCase()}-roast.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">Let the world know how bad you are at fantasy football</p>
      <div className="flex flex-wrap gap-2">
        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Share to Twitter/X */}
        <button
          onClick={handleShareTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        {/* Download Image */}
        <button
          onClick={handleDownloadImage}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Image
        </button>
      </div>
    </div>
  );
}
