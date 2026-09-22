import { NextResponse } from 'next/server';
import { config } from '@/server/config/env';
import { isSupabaseConnected, areSupabaseTablesReady, initSupabase } from '@/server/config/supabase';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Attempt quick connectivity probe if not connected yet
  if (!isSupabaseConnected() && config.supabase.url && config.supabase.key) {
    await initSupabase().catch(() => {});
  }

  const supabaseStatus = !isSupabaseConnected()
    ? 'disconnected / mock mode'
    : areSupabaseTablesReady()
    ? 'connected (tables ready)'
    : 'connected (tables missing - run supabase-schema.sql in Supabase SQL editor)';

  return NextResponse.json({
    status: 'healthy',
    service: 'PlacePrep AI Next.js Backend',
    version: '1.0.0',
    mode: config.useMockAI ? 'Development Mock Mode' : 'Production Azure AI Mode',
    database: {
      supabase: supabaseStatus,
      tablesReady: areSupabaseTablesReady(),
      urlConfigured: !!config.supabase.url,
      keyConfigured: !!config.supabase.key,
    },
    integrations: {
      microsoftFoundry: !!config.azure.foundry.apiKey,
      azureOpenAI: !!config.azure.openai.apiKey,
      azureAISearch: !!config.azure.search.apiKey,
      azureAISpeech: !!config.azure.speech.key,
      azureAIVision: !!config.azure.vision.key,
      supabase: isSupabaseConnected(),
    },
    timestamp: new Date().toISOString()
  });
}
