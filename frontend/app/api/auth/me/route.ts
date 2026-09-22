import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, formatUser, DEMO_USER_ID } from '@/server/auth';
import { User } from '@/server/models/User';
import { isSupabaseConnected } from '@/server/config/supabase';

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  if (isSupabaseConnected() && user.userId && !user.userId.startsWith('usr_')) {
    try {
      const dbUser = await User.findById(user.userId);
      if (dbUser) {
        return NextResponse.json({ user: formatUser(dbUser) });
      }
    } catch (dbErr) {
      console.warn('[Auth Me] User query skipped:', dbErr);
    }
  }

  // Fallback user based on token payload
  return NextResponse.json({
    user: {
      id: user.userId || DEMO_USER_ID,
      name: user.name || 'Demo Student',
      email: user.email || 'student@placeprep.ai',
      targetRole: user.targetRole || 'Software Developer',
      collegeYear: '',
      preparationProgress: 0,
      dailyStreak: 0,
      interviewsCompleted: 0,
      topicsCovered: 0,
    }
  });
}
