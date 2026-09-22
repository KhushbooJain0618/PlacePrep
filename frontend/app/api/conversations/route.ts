import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { Conversation } from '@/server/models/Conversation';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const conversations = await Conversation.findByUser(user.userId);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    console.error('[Conversations GET Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
