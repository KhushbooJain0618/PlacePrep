import { NextRequest, NextResponse } from 'next/server';
import { interviewService } from '@/server/services/interviewService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { role = 'Software Developer', difficulty = 'Beginner', type = 'Technical', questions = 5 } = body;

    const session = interviewService.startSession({
      role,
      difficulty,
      type,
      questions: Number(questions),
    });

    return NextResponse.json(session);
  } catch (err: any) {
    console.error('[Interview Start Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to start interview session' },
      { status: 500 }
    );
  }
}
