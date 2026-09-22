import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import { isSupabaseConnected, areSupabaseTablesReady } from '../config/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const supabaseStatus = !isSupabaseConnected()
    ? 'disconnected / mock mode'
    : areSupabaseTablesReady()
    ? 'connected (tables ready)'
    : 'connected (tables missing - run backend/supabase-schema.sql in Supabase SQL editor)';

  res.json({
    status: 'healthy',
    service: 'PlacePrep AI Backend',
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
});
