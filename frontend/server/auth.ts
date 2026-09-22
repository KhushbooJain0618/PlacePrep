import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from './config/env';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name?: string;
  targetRole?: string;
}

import bcrypt from 'bcryptjs';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// Shared in-memory mock users store for development / offline database fallback
export const mockUsers = new Map<string, any>();
mockUsers.set('student@college.edu', {
  id: DEMO_USER_ID,
  name: 'Demo Student',
  email: 'student@college.edu',
  password: bcrypt.hashSync('password123', 10),
  targetRole: 'Software Developer',
  collegeYear: 'Final Year',
  preparationProgress: 65,
  dailyStreak: 3,
  interviewsCompleted: 2,
  topicsCovered: 14,
});

export const generateToken = (payload: { userId: string; email: string; name: string; targetRole: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const extractToken = (req: NextRequest | Request): string | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // Fallback to cookie if present (NextRequest or standard Request)
  if ('cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    const cookieToken = (req as NextRequest).cookies.get('placeprep_token')?.value;
    if (cookieToken) return cookieToken;
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/placeprep_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
};

export const optionalAuth = (req: NextRequest | Request): AuthUserPayload | null => {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const requireAuth = (req: NextRequest | Request): { user: AuthUserPayload } | { errorResponse: NextResponse } => {
  const token = extractToken(req);

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication token missing or invalid' },
        { status: 401 }
      ),
    };
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUserPayload;
    return { user: decoded };
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized', message: 'Session expired or token is invalid. Please sign in again.' },
        { status: 401 }
      ),
    };
  }
};

export const formatUser = (user: any) => ({
  id: user.id || user._id?.toString() || DEMO_USER_ID,
  name: user.name,
  email: user.email,
  targetRole: user.targetRole || user.target_role || 'Software Developer',
  collegeYear: user.collegeYear || user.college_year || '',
  preparationProgress: user.preparationProgress ?? user.preparation_progress ?? 0,
  dailyStreak: user.dailyStreak ?? user.daily_streak ?? 1,
  interviewsCompleted: user.interviewsCompleted ?? user.interviews_completed ?? 0,
  topicsCovered: user.topicsCovered ?? user.topics_covered ?? 0,
});
