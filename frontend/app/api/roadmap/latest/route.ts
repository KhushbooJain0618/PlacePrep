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
    const latest = await RoadmapHistory.getLatestByUser(user.userId);
    return NextResponse.json({ roadmap: latest });
  } catch (err: any) {
    console.error('[Roadmap Latest GET Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to fetch latest roadmap' },
      { status: 500 }
    );
  }
}
