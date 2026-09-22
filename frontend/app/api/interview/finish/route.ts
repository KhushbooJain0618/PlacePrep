import { NextRequest, NextResponse } from 'next/server';
import { interviewService } from '@/server/services/interviewService';
import { optionalAuth } from '@/server/auth';
import { isSupabaseConnected } from '@/server/config/supabase';
import { InterviewHistory } from '@/server/models/InterviewHistory';
import { User } from '@/server/models/User';

export async function POST(req: NextRequest) {
  try {
    const user = optionalAuth(req);
    const body = await req.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: true, message: 'Session ID is required.' }, { status: 400 });
    }

    const report = await interviewService.finishSession(sessionId);

    // Persist interview evaluation if user is authenticated and Supabase is active
    if (user && isSupabaseConnected()) {
      try {
        await InterviewHistory.create(user.userId, report);
        const dbUser = await User.findById(user.userId);
        if (dbUser) {
          const newProgress = Math.max(dbUser.preparationProgress || 0, Math.round(report.overallScore || 0));
          await User.findByIdAndUpdate(user.userId, {
            interviewsCompleted: (dbUser.interviewsCompleted || 0) + 1,
            preparationProgress: newProgress
          });
        }
      } catch (persistErr) {
        console.warn('[Interview] History persistence error:', persistErr);
      }
    }

    return NextResponse.json(report);
  } catch (err: any) {
    console.error('[Interview Finish Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to finish interview session' },
      { status: 500 }
    );
  }
}
