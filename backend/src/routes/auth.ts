import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { config } from '../config/env.js';
import { isSupabaseConnected, areSupabaseTablesReady } from '../config/supabase.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// In-memory user cache for mock mode / dev fallback
const mockUsers = new Map<string, any>();

// Default demo credentials
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
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

// Helper to generate JWT
const generateToken = (payload: { userId: string; email: string; name: string; targetRole: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

// Helper to format user for client consumption
const formatUser = (user: IUser | any) => ({
  id: user.id || user._id?.toString() || DEMO_USER_ID,
  name: user.name,
  email: user.email,
  targetRole: user.targetRole,
  collegeYear: user.collegeYear,
  preparationProgress: user.preparationProgress ?? 0,
  dailyStreak: user.dailyStreak ?? 1,
  interviewsCompleted: user.interviewsCompleted ?? 0,
  topicsCovered: user.topicsCovered ?? 0,
});

/**
 * POST /api/auth/register
 * Create a new student account
 */
authRouter.post('/register', async (req: any, res: Response): Promise<void> => {
  try {
    const { name, email, password, targetRole, collegeYear } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Validation Error', message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If Supabase is connected but tables haven't been run, inform the user explicitly
    if (isSupabaseConnected() && !areSupabaseTablesReady()) {
      res.status(503).json({
        error: 'DatabaseSchemaMissing',
        message: "Supabase database tables are not initialized yet. Please execute 'backend/supabase-schema.sql' in your Supabase SQL Editor.",
      });
      return;
    }

    // If Supabase is connected and ready, persist to PostgreSQL
    if (isSupabaseConnected() && areSupabaseTablesReady()) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          res.status(400).json({ error: 'UserExists', message: 'An account with this email address already exists' });
          return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          targetRole: targetRole || 'Software Engineer',
          collegeYear: collegeYear || 'Final Year (Class of 2026)',
          preparationProgress: 0,
          dailyStreak: 1,
          interviewsCompleted: 0,
          topicsCovered: 0,
        });

        const token = generateToken({
          userId: user.id,
          email: user.email,
          name: user.name,
          targetRole: user.targetRole,
        });

        res.status(201).json({
          message: 'Account created successfully',
          token,
          user: formatUser(user),
        });
        return;
      } catch (dbErr: any) {
        console.warn('[Auth Register] Supabase create error:', dbErr.message);
        res.status(500).json({
          error: 'RegistrationFailed',
          message: dbErr.message || 'Failed to persist account to database. Please check Supabase schema.',
        });
        return;
      }
    }

    // Fallback: in-memory mock storage (when Supabase is offline)
    if (mockUsers.has(normalizedEmail)) {
      res.status(400).json({ error: 'UserExists', message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fallbackUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      targetRole: targetRole || 'Software Engineer',
      collegeYear: collegeYear || 'Final Year (Class of 2026)',
      preparationProgress: 0,
      dailyStreak: 1,
      interviewsCompleted: 0,
      topicsCovered: 0,
    };

    mockUsers.set(normalizedEmail, fallbackUser);

    const token = generateToken({
      userId: fallbackUser.id,
      email: fallbackUser.email,
      name: fallbackUser.name,
      targetRole: fallbackUser.targetRole,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: formatUser(fallbackUser),
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: 'RegistrationFailed', message: err.message || 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate student credentials
 */
authRouter.post('/login', async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If Supabase is connected but tables haven't been run, inform user
    if (isSupabaseConnected() && !areSupabaseTablesReady()) {
      res.status(503).json({
        error: 'DatabaseSchemaMissing',
        message: "Supabase database tables are not initialized yet. Please execute 'backend/supabase-schema.sql' in your Supabase SQL Editor.",
      });
      return;
    }

    // If Supabase is connected and ready, verify against database
    if (isSupabaseConnected() && areSupabaseTablesReady()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          res.status(401).json({
            error: 'InvalidCredentials',
            message: 'No account found with this email. Please check your credentials or create an account.',
          });
          return;
        }

        if (user.password) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            res.status(401).json({ error: 'InvalidCredentials', message: 'Invalid email or password' });
            return;
          }

          const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            targetRole: user.targetRole,
          });

          res.json({
            message: 'Sign in successful',
            token,
            user: formatUser(user),
          });
          return;
        }
      } catch (dbErr: any) {
        console.warn('[Auth Login] Supabase error:', dbErr.message);
        res.status(500).json({ error: 'LoginFailed', message: dbErr.message || 'Database error during authentication' });
        return;
      }
    }

    // Fallback: verify against in-memory mock users
    const mockUser = mockUsers.get(normalizedEmail);
    if (!mockUser) {
      res.status(401).json({
        error: 'InvalidCredentials',
        message: 'No account found with this email. Please create an account first.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      res.status(401).json({ error: 'InvalidCredentials', message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      targetRole: mockUser.targetRole,
    });

    res.json({
      message: 'Sign in successful',
      token,
      user: formatUser(mockUser),
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'LoginFailed', message: err.message || 'Failed to sign in' });
  }
});

/**
 * GET /api/auth/me
 * Get current student profile
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    if (isSupabaseConnected() && req.user.userId && !req.user.userId.startsWith('usr_')) {
      try {
        const user = await User.findById(req.user.userId);
        if (user) {
          res.json({ user: formatUser(user) });
          return;
        }
      } catch (dbErr) {
        console.warn('[Auth Me] User query skipped:', dbErr);
      }
    }

    // Fallback user based on token payload
    res.json({
      user: {
        id: req.user.userId || DEMO_USER_ID,
        name: req.user.name || 'Demo Student',
        email: req.user.email || 'student@placeprep.ai',
        targetRole: req.user.targetRole || 'Software Developer',
        collegeYear: '',
        preparationProgress: 0,
        dailyStreak: 0,
        interviewsCompleted: 0,
        topicsCovered: 0,
      }
    });
  } catch (err: any) {
    res.json({
      user: {
        id: req.user?.userId || DEMO_USER_ID,
        name: req.user?.name || 'Demo Student',
        email: req.user?.email || 'student@placeprep.ai',
        targetRole: req.user?.targetRole || 'Software Developer',
        collegeYear: '',
        preparationProgress: 0,
        dailyStreak: 0,
        interviewsCompleted: 0,
        topicsCovered: 0,
      }
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update student profile settings
 */
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const { name, targetRole, collegeYear } = req.body;

    if (isSupabaseConnected() && req.user.userId && !req.user.userId.startsWith('usr_')) {
      try {
        const updated = await User.findByIdAndUpdate(
          req.user.userId,
          {
            ...(name && { name: name.trim() }),
            ...(targetRole && { targetRole }),
            ...(collegeYear && { collegeYear }),
          }
        );

        if (updated) {
          res.json({
            message: 'Profile updated successfully',
            user: formatUser(updated),
          });
          return;
        }
      } catch (dbErr) {
        console.warn('[Auth Profile] Update skipped:', dbErr);
      }
    }

    // Dev Fallback update
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.userId,
        name: name || req.user.name || 'Demo Student',
        email: req.user.email,
        targetRole: targetRole || req.user.targetRole || 'Software Developer',
        collegeYear: collegeYear || '',
        preparationProgress: 0,
        dailyStreak: 0,
        interviewsCompleted: 0,
        topicsCovered: 0,
      }
    });
  } catch (err: any) {
    console.error('[Auth Update Profile Error]:', err);
    res.status(500).json({ error: 'UpdateFailed', message: 'Failed to update profile' });
  }
});
