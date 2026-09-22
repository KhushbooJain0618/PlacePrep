import { getSupabase, isSupabaseConnected } from '../config/supabase.js';
import { InterviewFinishResponse } from './types.js';

export interface InterviewHistoryRow {
  id: string;
  user_id: string;
  session_id: string;
  role: string;
  difficulty: string;
  overall_score: number;
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  question_reviews: any[];
  completed_at: string;
  created_at: string;
}

const rowToInterview = (row: InterviewHistoryRow): InterviewFinishResponse & { id: string; userId: string } => ({
  id: row.id,
  userId: row.user_id,
  sessionId: row.session_id,
  role: row.role,
  difficulty: row.difficulty as any,
  overallScore: row.overall_score,
  technical: row.technical_score,
  relevance: row.relevance_score,
  communication: row.communication_score,
  strengths: Array.isArray(row.strengths) ? row.strengths : [],
  improvements: Array.isArray(row.improvements) ? row.improvements : [],
  recommendations: Array.isArray(row.recommendations) ? row.recommendations : [],
  questionReviews: Array.isArray(row.question_reviews) ? row.question_reviews : [],
  completedAt: row.completed_at,
  aiDisclaimer: 'Scores and feedback are AI-generated estimates based on defined technical evaluation rubrics for student preparation purposes.'
});

export const InterviewHistory = {
  async create(userId: string, report: InterviewFinishResponse): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('interview_history')
      .insert([{
        user_id: userId,
        session_id: report.sessionId,
        role: report.role,
        difficulty: report.difficulty,
        overall_score: report.overallScore,
        technical_score: report.technical,
        relevance_score: report.relevance,
        communication_score: report.communication,
        strengths: report.strengths || [],
        improvements: report.improvements || [],
        recommendations: report.recommendations || [],
        question_reviews: report.questionReviews || [],
        completed_at: report.completedAt || new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      console.warn('[Supabase InterviewHistory.create error]:', error.message);
      return null;
    }
    return data?.id || null;
  },

  async findByUser(userId: string, limit = 20) {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return [];

    const { data, error } = await supabase
      .from('interview_history')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Supabase InterviewHistory.findByUser error]:', error.message);
      return [];
    }
    return (data || []).map(r => rowToInterview(r as InterviewHistoryRow));
  },

  async findBySessionId(sessionId: string) {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('interview_history')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase InterviewHistory.findBySessionId error]:', error.message);
      return null;
    }
    return data ? rowToInterview(data as InterviewHistoryRow) : null;
  }
};
