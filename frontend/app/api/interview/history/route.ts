import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { InterviewHistory } from '@/server/models/InterviewHistory';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const interviews = await InterviewHistory.findByUser(user.userId);
    return NextResponse.json({ interviews });
  } catch (err: any) {
    console.error('[Interview History GET Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to fetch interview history' },
      { status: 500 }
    );
  }
}
