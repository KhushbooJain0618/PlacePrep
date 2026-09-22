import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/server/services/aiService';
import { chatbotClassifier } from '@/server/services/chatbotClassifier';
import { optionalAuth } from '@/server/auth';
import { Conversation } from '@/server/models/Conversation';
import { Message } from '@/server/models/Message';
import { isSupabaseConnected } from '@/server/config/supabase';

const makeTitle = (message: string): string => {
  const trimmed = chatbotClassifier.sanitize(message);
  return trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed;
};

export async function POST(req: NextRequest) {
  try {
    const user = optionalAuth(req);
    const body = await req.json().catch(() => ({}));
    const { message, history, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: true, message: 'Please provide a valid question for the placement assistant.' },
        { status: 400 }
      );
    }

    const sanitizedMessage = chatbotClassifier.sanitize(message);
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Please provide a valid question for the placement assistant.' },
        { status: 400 }
      );
    }

    if (chatbotClassifier.detectSecurityRisk(sanitizedMessage)) {
      return NextResponse.json({
        answer: 'I am **PlacePrep AI**, your campus placement preparation assistant. I focus exclusively on helping students master DSA, Operating Systems, DBMS, Networks, and System Design for technical recruitment interviews.',
        sources: ['Placement Preparation Policy']
      });
    }

    const response = await aiService.generateChatResponse(sanitizedMessage, history);

    let activeConversationId: string | undefined = conversationId;

    // Persist history only for logged-in users with an active Supabase connection
    if (user && isSupabaseConnected()) {
      try {
        if (!activeConversationId) {
          const created = await Conversation.create(user.userId, makeTitle(message));
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
        console.warn('[Chat] History persistence skipped:', persistErr);
      }
    }

    return NextResponse.json({ ...response, conversationId: activeConversationId });
  } catch (err: any) {
    console.error('[Chat Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Internal server error processing chat request.' },
      { status: 500 }
    );
  }
}
