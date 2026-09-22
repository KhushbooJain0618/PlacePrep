import { NextResponse } from 'next/server';
import { visionService } from '@/server/services/visionService';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    notice: visionService.getResponsibleAiDisclaimer()
  });
}
