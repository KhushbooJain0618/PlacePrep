import { NextRequest, NextResponse } from 'next/server';
import { interviewService } from '@/server/services/interviewService';
import { speechService } from '@/server/services/speechService';
import { visionService } from '@/server/services/visionService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, questionId, transcript, audioBase64, visionSignals } = body;

    if (!sessionId) {
      return NextResponse.json({ error: true, message: 'Session ID is required.' }, { status: 400 });
    }

    // Process speech transcription if transcript not provided directly
    let finalTranscript = transcript;
    if (!finalTranscript && audioBase64) {
      const speechRes = await speechService.transcribeAudio(audioBase64);
      finalTranscript = speechRes.transcript;
    }

    // Process defensible vision signals
    const visionTelemetry = visionService.processInteractionSignals(visionSignals);

    const answerResult = await interviewService.submitAnswer({
      sessionId,
      questionId,
      transcript: finalTranscript || 'Answer submitted.',
      visionSignals
    });

    return NextResponse.json({
      ...answerResult,
      transcript: finalTranscript,
      visionNotice: visionTelemetry.notice
    });
  } catch (err: any) {
    console.error('[Interview Answer Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to submit interview answer' },
      { status: 500 }
    );
  }
}
