import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getReport } from '@/lib/report-storage';
import { getVerdict } from '@/lib/copy';
import { SharedReport } from './SharedReport';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return {
      title: 'Report Not Found',
    };
  }

  const verdict = getVerdict(report);
  const description = `${report.totalPointsLeftOnBench.toFixed(1)} points left on bench, ${report.blownWins} blown win${report.blownWins !== 1 ? 's' : ''}. ${verdict}`;

  return {
    title: `${report.teamName} Fantasy Roast | YouSuckAtFantasyFootball.com`,
    description,
    openGraph: {
      title: `${report.teamName} Fantasy Roast`,
      description,
      images: [`/api/og/${id}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${report.teamName} Fantasy Roast`,
      description,
      images: [`/api/og/${id}`],
    },
  };
}

export default async function SharedReportPage({ params }: PageProps) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return <SharedReport report={report} />;
}
