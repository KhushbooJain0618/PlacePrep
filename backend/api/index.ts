import app from '../src/app.js';
import { initSupabase } from '../src/config/supabase.js';

// Pre-warm database connection
initSupabase().catch((err) => {
  console.warn('[Vercel Serverless] Supabase warm-up warning:', err);
});

export default app;
