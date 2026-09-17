import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error Middleware]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const userMessage = err.isOperational
    ? err.message
    : 'Something went wrong while connecting to the AI service. Please try again.';

  res.status(statusCode).json({
    error: true,
    message: userMessage,
    timestamp: new Date().toISOString()
  });
}
