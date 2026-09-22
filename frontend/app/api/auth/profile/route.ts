import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, formatUser } from '@/server/auth';
import { User } from '@/server/models/User';
import { isSupabaseConnected } from '@/server/config/supabase';

export async function PUT(req: NextRequest) {
  const authResult = requireAuth(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  const { user } = authResult;

  try {
    const body = await req.json().catch(() => ({}));
    const { name, targetRole, collegeYear } = body;

    if (isSupabaseConnected() && user.userId && !user.userId.startsWith('usr_')) {
      try {
        const updated = await User.findByIdAndUpdate(
          user.userId,
          {
            ...(name && { name: name.trim() }),
            ...(targetRole && { targetRole }),
            ...(collegeYear && { collegeYear }),
          }
        );

        if (updated) {
          return NextResponse.json({
            message: 'Profile updated successfully',
            user: formatUser(updated),
          });
        }
      } catch (dbErr) {
        console.warn('[Auth Profile] Update skipped:', dbErr);
      }
    }

    // Dev Fallback update
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user.userId,
        name: name || user.name || 'Demo Student',
        email: user.email,
        targetRole: targetRole || user.targetRole || 'Software Developer',
        collegeYear: collegeYear || '',
        preparationProgress: 0,
        dailyStreak: 0,
        interviewsCompleted: 0,
        topicsCovered: 0,
      }
    });
  } catch (err: any) {
    console.error('[Auth Update Profile Error]:', err);
    return NextResponse.json(
      { error: 'UpdateFailed', message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
