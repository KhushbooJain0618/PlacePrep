import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { chatRouter } from './routes/chat.js';
import { interviewRouter } from './routes/interview.js';
import { roadmapRouter } from './routes/roadmap.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', config.frontendUrl],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/roadmap', roadmapRouter);

// Central error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🚀 PlacePrep AI Backend running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Engine Mode: ${config.useMockAI ? 'Development Mock Mode (USE_MOCK_AI=true)' : 'Azure Production Mode'}`);
  console.log(`🔗 Health Check: http://localhost:${config.port}/api/health`);
  console.log('====================================================');
});
