import { NextRequest, NextResponse } from 'next/server';
import { speechService } from '@/server/services/speechService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: true, message: 'Text is required for speech synthesis.' }, { status: 400 });
    }

    const audioBuffer = await speechService.synthesizeSpeech(text);
    if (!audioBuffer) {
      return NextResponse.json(
        {
          error: true,
          message: 'Azure Speech TTS is not configured or synthesis failed.'
        },
        { status: 503 }
      );
    }

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err: any) {
    console.error('[TTS Error]:', err);
    return NextResponse.json({ error: true, message: err.message || 'Speech synthesis failed' }, { status: 500 });
  }
}
