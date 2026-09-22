import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { Conversation } from '@/server/models/Conversation';
import { Message } from '@/server/models/Message';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const conversationId = params.id;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.userId !== user.userId) {
      return NextResponse.json(
        { error: true, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    const messages = await Message.findByConversation(conversation.id);
    return NextResponse.json({ conversation, messages });
  } catch (err: any) {
    console.error('[Conversation Detail GET Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;
  const conversationId = params.id;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || conversation.userId !== user.userId) {
      return NextResponse.json(
        { error: true, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    const deleted = await Conversation.delete(conversationId, user.userId);
    if (!deleted) {
      return NextResponse.json(
        { error: true, message: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Conversation deleted' });
  } catch (err: any) {
    console.error('[Conversation DELETE Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
