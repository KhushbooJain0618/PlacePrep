import rateLimit from 'express-rate-limit';

/**
 * Global API rate limiter (protects backend against general flood & scrapers)
 * 300 requests per 15-minute window per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for Authentication endpoints
 * Protects /api/auth/login and /api/auth/register against brute-force attacks.
 * 15 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
});

/**
 * AI & Cloud Quota rate limiter
 * Protects expensive Azure OpenAI, Azure Search, and Azure Speech TTS endpoints.
 * 30 AI interactions per minute per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'AI request limit reached. Please wait a moment before sending more AI requests.',
  },
});
