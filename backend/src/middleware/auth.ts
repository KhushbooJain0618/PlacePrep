import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name?: string;
  targetRole?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session expired or token is invalid. Please sign in again.',
    });
  }
};
/**
 * Like requireAuth, but does not reject the request if no/invalid token is present.
 * Attaches req.user only when a valid token is found. Used for routes (like /api/chat)
 * that must keep working for guests, but persist history when a user IS logged in.
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    req.user = decoded;
  } catch {
    // Invalid/expired token — proceed as guest rather than blocking the request
  }
  next();
};