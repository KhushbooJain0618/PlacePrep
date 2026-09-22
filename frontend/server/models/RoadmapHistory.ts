import { getSupabase, isSupabaseConnected, isUuid } from '../config/supabase';
import { RoadmapGenerateResponse } from './types';

export interface RoadmapHistoryRow {
  id: string;
  user_id: string;
  target_role: string;
  level: string;
  duration_days: number;
  daily_hours: number;
  total_weeks: number;
  progress_percentage: number;
  weeks: any[];
  created_at: string;
  updated_at: string;
}

const rowToRoadmap = (row: RoadmapHistoryRow): RoadmapGenerateResponse & { id: string; userId: string } => ({
  id: row.id,
  userId: row.user_id,
  targetRole: row.target_role,
  level: row.level as any,
  durationDays: row.duration_days,
  dailyHours: Number(row.daily_hours),
  totalWeeks: row.total_weeks,
  progressPercentage: row.progress_percentage ?? 0,
  weeks: Array.isArray(row.weeks) ? row.weeks : [],
  createdAt: row.created_at
});

export const RoadmapHistory = {
  async create(userId: string, roadmap: RoadmapGenerateResponse): Promise<string | null> {
    if (!isUuid(userId)) return null;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('roadmap_history')
      .insert([{
        user_id: userId,
        target_role: roadmap.targetRole,
        level: roadmap.level,
        duration_days: roadmap.durationDays,
        daily_hours: roadmap.dailyHours,
        total_weeks: roadmap.totalWeeks,
        progress_percentage: roadmap.progressPercentage || 0,
        weeks: roadmap.weeks || []
      }])
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase RoadmapHistory.create error]:', error.message);
      return null;
    }
    return data?.id || null;
  },

  async getLatestByUser(userId: string) {
    if (!isUuid(userId)) return null;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('roadmap_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase RoadmapHistory.getLatestByUser error]:', error.message);
      return null;
    }
    return data ? rowToRoadmap(data as RoadmapHistoryRow) : null;
  },

  async findByUser(userId: string, limit = 10) {
    if (!isUuid(userId)) return [];
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return [];

    const { data, error } = await supabase
      .from('roadmap_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Supabase RoadmapHistory.findByUser error]:', error.message);
      return [];
    }
    return (data || []).map(r => rowToRoadmap(r as RoadmapHistoryRow));
  },

  async updateProgress(id: string, userId: string, progressPercentage: number): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return false;

    const { error } = await supabase
      .from('roadmap_history')
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('[Supabase RoadmapHistory.updateProgress error]:', error.message);
      return false;
    }
    return true;
  }
};
