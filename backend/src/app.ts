import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { interviewRouter } from './routes/interview.js';
import { roadmapRouter } from './routes/roadmap.js';
import { healthRouter } from './routes/health.js';
import { azureRouter } from './routes/azure.js';
import { conversationsRouter } from './routes/conversations.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter, authLimiter, aiLimiter } from './middleware/rateLimit.js';

export const app = express();

// Trust reverse proxy (essential for Vercel edge/load balancer and rate limiting)
app.set('trust proxy', 1);

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
if (config.frontendUrl) {
  config.frontendUrl.split(',').forEach((url) => {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned && !allowedOrigins.includes(cleaned)) {
      allowedOrigins.push(cleaned);
    }
  });
}

// CORS setup: supports local dev, configured FRONTEND_URL, and Vercel preview domains (*.vercel.app)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Request logging in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Root status endpoints for immediate deployment verification
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PlacePrep AI Backend',
    version: '1.0.0',
    mode: config.useMockAI ? 'Mock Mode' : 'Azure Production Mode',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PlacePrep AI Backend API',
    version: '1.0.0',
    mode: config.useMockAI ? 'Mock Mode' : 'Azure Production Mode',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/azure', azureRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/conversations', conversationsRouter);

// Central error handler
app.use(errorHandler);

export default app;
