import { NextRequest, NextResponse } from 'next/server';
import { roadmapService } from '@/server/services/roadmapService';
import { optionalAuth } from '@/server/auth';
import { isSupabaseConnected } from '@/server/config/supabase';
import { RoadmapHistory } from '@/server/models/RoadmapHistory';

export async function POST(req: NextRequest) {
  try {
    const user = optionalAuth(req);
    const body = await req.json().catch(() => ({}));
    const {
      role = 'Software Developer',
      level = 'Beginner',
      dailyHours = 2,
      duration = 60,
      topics = ['DSA', 'OOP', 'DBMS', 'OS', 'SQL']
    } = body;

    const roadmap = roadmapService.generateRoadmap({
      role,
      level,
      dailyHours: Number(dailyHours),
      duration: Number(duration),
      topics: Array.isArray(topics) ? topics : ['DSA', 'OOP', 'DBMS', 'OS', 'SQL']
    });

    // Persist roadmap if user is authenticated and Supabase is active
    if (user && isSupabaseConnected()) {
      try {
        const savedId = await RoadmapHistory.create(user.userId, roadmap);
        if (savedId) {
          roadmap.id = savedId;
        }
      } catch (persistErr) {
        console.warn('[Roadmap] History persistence error:', persistErr);
      }
    }

    return NextResponse.json(roadmap);
  } catch (err: any) {
    console.error('[Roadmap Generate Error]:', err);
    return NextResponse.json(
      { error: true, message: err.message || 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
