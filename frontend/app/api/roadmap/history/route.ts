import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/auth';
import { RoadmapHistory } from '@/server/models/RoadmapHistory';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const history = await RoadmapHistory.findByUser(user.userId);
    return NextResponse.json({ roadmaps: history });
  } catch (err: any) {
    console.error('[Roadmap History GET Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to fetch roadmap history' },
      { status: 500 }
    );
  }
}
