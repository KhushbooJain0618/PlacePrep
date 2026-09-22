import { Router, Request, Response, NextFunction } from 'express';
import { roadmapService } from '../services/roadmapService.js';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { isSupabaseConnected } from '../config/supabase.js';
import { RoadmapHistory } from '../models/RoadmapHistory.js';

export const roadmapRouter = Router();

// POST /api/roadmap/generate
roadmapRouter.post('/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      role = 'Software Developer',
      level = 'Beginner',
      dailyHours = 2,
      duration = 60,
      topics = ['DSA', 'OOP', 'DBMS', 'OS', 'SQL']
    } = req.body;

    const roadmap = roadmapService.generateRoadmap({
      role,
      level,
      dailyHours: Number(dailyHours),
      duration: Number(duration),
      topics: Array.isArray(topics) ? topics : ['DSA', 'OOP', 'DBMS', 'OS', 'SQL']
    });

    // Persist roadmap if user is authenticated and Supabase is active
    if (req.user && isSupabaseConnected()) {
      try {
        const savedId = await RoadmapHistory.create(req.user.userId, roadmap);
        if (savedId) {
          roadmap.id = savedId;
        }
      } catch (persistErr) {
        console.warn('[Roadmap] History persistence error:', persistErr);
      }
    }

    return res.json(roadmap);
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmap/latest
roadmapRouter.get('/latest', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    const latest = await RoadmapHistory.getLatestByUser(req.user.userId);
    return res.json({ roadmap: latest });
  } catch (err) {
    next(err);
  }
});

// GET /api/roadmap/history
roadmapRouter.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    const history = await RoadmapHistory.findByUser(req.user.userId);
    return res.json({ roadmaps: history });
  } catch (err) {
    next(err);
  }
});
