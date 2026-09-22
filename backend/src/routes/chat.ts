import { Router, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { isSupabaseConnected } from '../config/supabase.js';

export const chatRouter = Router();

const makeTitle = (message: string): string => {
  const trimmed = message.trim().replace(/\s+/g, ' ');
  return trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;
};

chatRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { message, history, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Please provide a valid question for the placement assistant.'
      });
    }

    const response = await aiService.generateChatResponse(message.trim(), history);

    // Persist history only for logged-in users with an active Supabase connection.
    // Guests / offline-DB mode keep working exactly as before — no behavior change for them.
    let activeConversationId: string | undefined = conversationId;

    if (req.user && isSupabaseConnected()) {
      try {
        if (!activeConversationId) {
          const created = await Conversation.create(req.user.userId, makeTitle(message));
          activeConversationId = created?.id;
        }

        if (activeConversationId) {
          await Message.create({
            conversationId: activeConversationId,
            role: 'user',
            content: message.trim(),
          });
          await Message.create({
            conversationId: activeConversationId,
            role: 'assistant',
            content: response.answer,
            sources: response.sources,
          });
          await Conversation.touch(activeConversationId);
        }
      } catch (persistErr) {
        console.warn('⚠️ [Chat] History persistence skipped:', persistErr);
      }
    }

    return res.json({ ...response, conversationId: activeConversationId });
  } catch (err) {
    next(err);
  }
});