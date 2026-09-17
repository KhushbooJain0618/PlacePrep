import { Router, Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService.js';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Please provide a valid question for the placement assistant.'
      });
    }

    const response = await aiService.generateChatResponse(message.trim(), history);
    return res.json(response);
  } catch (err) {
    next(err);
  }
});
