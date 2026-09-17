import { Router, Request, Response, NextFunction } from 'express';
import { roadmapService } from '../services/roadmapService.js';

export const roadmapRouter = Router();

// POST /api/roadmap/generate
roadmapRouter.post('/generate', (req: Request, res: Response, next: NextFunction) => {
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

    return res.json(roadmap);
  } catch (err) {
    next(err);
  }
});
