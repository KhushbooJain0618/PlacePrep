import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

export const conversationsRouter = Router();

// GET /api/conversations — list current user's conversations
conversationsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await Conversation.findByUser(req.user!.userId);
    return res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id — one conversation with its messages
conversationsRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || conversation.userId !== req.user!.userId) {
      return res.status(404).json({ error: true, message: 'Conversation not found' });
    }

    const messages = await Message.findByConversation(conversation.id);
    return res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/conversations/:id
conversationsRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation || conversation.userId !== req.user!.userId) {
      return res.status(404).json({ error: true, message: 'Conversation not found' });
    }

    const deleted = await Conversation.delete(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(500).json({ error: true, message: 'Failed to delete conversation' });
    }
    return res.json({ message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
});