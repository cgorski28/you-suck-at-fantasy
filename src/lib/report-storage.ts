import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';
import type { ReportData } from './types';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

interface StoredReport {
  reportData: ReportData;
  createdAt: number;
}

export async function saveReport(data: ReportData): Promise<string> {
  const id = nanoid(10);
  const stored: StoredReport = {
    reportData: data,
    createdAt: Date.now(),
  };
  await redis.set(`report:${id}`, JSON.stringify(stored));
  return id;
}

export async function getReport(id: string): Promise<ReportData | null> {
  const result = await redis.get<string>(`report:${id}`);
  if (!result) return null;

  // Handle both string and already-parsed object cases
  const parsed: StoredReport = typeof result === 'string' ? JSON.parse(result) : result;
  return parsed.reportData;
}
