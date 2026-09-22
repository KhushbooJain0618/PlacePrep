import { NextResponse } from 'next/server';
import { speechService } from '@/server/services/speechService';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await speechService.issueToken();
  if (!result) {
    return NextResponse.json(
      {
        error: true,
        message: 'Azure AI Speech is not configured or token generation failed.'
      },
      { status: 503 }
    );
  }
  return NextResponse.json(result);
}
