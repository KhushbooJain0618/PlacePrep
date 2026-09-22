import { app } from './app.js';
import { config } from './config/env.js';
import { initSupabase } from './config/supabase.js';

// Initialize Database Connection
initSupabase().catch((err) => {
  console.error('Initial Supabase initialization error:', err);
});

// Start local server
export const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`PlacePrep AI Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`AI Engine Mode: ${config.useMockAI ? 'Development Mock Mode (USE_MOCK_AI=true)' : 'Azure Production Mode'}`);
  console.log(`Health Check: http://localhost:${config.port}/api/health`);
  console.log(`Database: Supabase PostgreSQL (${config.supabase.url || 'Dev Mock Mode'})`);
  console.log(`Azure Index: ${config.azure.search.indexName}`);
  console.log(`Azure Speech Region: ${config.azure.speech.region}`);
  console.log('====================================================');
});

export default server;
