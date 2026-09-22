import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { initSupabase } from './config/supabase.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { interviewRouter } from './routes/interview.js';
import { roadmapRouter } from './routes/roadmap.js';
import { healthRouter } from './routes/health.js';
import { azureRouter } from './routes/azure.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter, authLimiter, aiLimiter } from './middleware/rateLimit.js';

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', config.frontendUrl],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters (Global API defense; Health check exempted)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return globalLimiter(req, res, next);
});

// Targeted Strict Rate Limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/chat', aiLimiter);
app.use('/api/interview/start', aiLimiter);
app.use('/api/interview/answer', aiLimiter);
app.use('/api/azure/tts', aiLimiter);
import { conversationsRouter } from './routes/conversations.js';
// ...
app.use('/api/conversations', conversationsRouter);
// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Database Connection
initSupabase().catch((err) => {
  console.error('Initial Supabase initialization error:', err);
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/azure', azureRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/roadmap', roadmapRouter);

// Central error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
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

