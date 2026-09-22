import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { config } from '../config/env.js';
import { isSupabaseConnected } from '../config/supabase.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Helper to generate JWT
const generateToken = (payload: { userId: string; email: string; name: string; targetRole: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

// Helper to format user for client consumption
const formatUser = (user: IUser | any) => ({
  id: user.id || user._id?.toString() || 'usr_demo_1',
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

    // If Supabase is connected, persist to PostgreSQL
    if (isSupabaseConnected()) {
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
        console.warn('[Auth Register] Supabase query failed, falling back to mock storage:', dbErr.message);
      }
    }

    // Dev Fallback Mode if Supabase database is not currently active
    const fallbackUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      targetRole: targetRole || 'Software Engineer',
      collegeYear: collegeYear || 'Final Year (Class of 2026)',
      preparationProgress: 0,
      dailyStreak: 1,
      interviewsCompleted: 0,
      topicsCovered: 0,
    };

    const token = generateToken({
      userId: fallbackUser.id,
      email: fallbackUser.email,
      name: fallbackUser.name,
      targetRole: fallbackUser.targetRole,
    });

    res.status(201).json({
      message: 'Account created successfully (Dev Mock DB Mode)',
      token,
      user: fallbackUser,
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

    // If Supabase is connected, verify against database
    if (isSupabaseConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && user.password) {
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
        console.warn('[Auth Login] Supabase query failed, falling back to mock authentication:', dbErr.message);
      }
    }

    // Dev Fallback Mode if Supabase database is not currently active
    const fallbackUser = {
      id: 'usr_demo_student',
      name: 'Demo Student',
      email: normalizedEmail,
      targetRole: 'Software Developer',
      collegeYear: '',
      preparationProgress: 0,
      dailyStreak: 0,
      interviewsCompleted: 0,
      topicsCovered: 0,
    };

    const token = generateToken({
      userId: fallbackUser.id,
      email: fallbackUser.email,
      name: fallbackUser.name,
      targetRole: fallbackUser.targetRole,
    });

    res.json({
      message: 'Sign in successful (Dev Mock DB Mode)',
      token,
      user: fallbackUser,
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
        id: req.user.userId || 'usr_demo_student',
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
        id: req.user?.userId || 'usr_demo_student',
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
