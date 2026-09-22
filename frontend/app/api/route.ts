import { NextResponse } from 'next/server';
import { config } from '@/server/config/env';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'PlacePrep AI Next.js Fullstack API',
    version: '1.0.0',
    mode: config.useMockAI ? 'Mock Mode' : 'Azure Production Mode',
    timestamp: new Date().toISOString(),
  });
}
