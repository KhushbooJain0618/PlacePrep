import { getSupabase, isSupabaseConnected, isUuid } from '../config/supabase';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  targetRole: string;
  collegeYear: string;
  preparationProgress: number;
  dailyStreak: number;
  interviewsCompleted: number;
  topicsCovered: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password?: string;
  target_role: string;
  college_year: string;
  preparation_progress: number;
  daily_streak: number;
  interviews_completed: number;
  topics_covered: number;
  created_at: string;
  updated_at: string;
}

/**
 * Transform Supabase PostgreSQL row to camelCase IUser
 */
export const rowToUser = (row: UserRow): IUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  targetRole: row.target_role,
  collegeYear: row.college_year,
  preparationProgress: row.preparation_progress ?? 0,
  dailyStreak: row.daily_streak ?? 1,
  interviewsCompleted: row.interviews_completed ?? 0,
  topicsCovered: row.topics_covered ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Transform camelCase User data into Supabase snake_case columns
 */
export const userToRow = (data: Partial<IUser>): Partial<UserRow> => {
  const row: Partial<UserRow> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.email !== undefined) row.email = data.email;
  if (data.password !== undefined) row.password = data.password;
  if (data.targetRole !== undefined) row.target_role = data.targetRole;
  if (data.collegeYear !== undefined) row.college_year = data.collegeYear;
  if (data.preparationProgress !== undefined) row.preparation_progress = data.preparationProgress;
  if (data.dailyStreak !== undefined) row.daily_streak = data.dailyStreak;
  if (data.interviewsCompleted !== undefined) row.interviews_completed = data.interviewsCompleted;
  if (data.topicsCovered !== undefined) row.topics_covered = data.topicsCovered;
  return row;
};

/**
 * Supabase Data Access Layer for PlacePrep Users
 */
export const User = {
  /**
   * Find a user by email or id
   */
  async findOne(filter: { email?: string; id?: string }): Promise<IUser | null> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    let query = supabase.from('users').select('*');
    if (filter.email) {
      query = query.ilike('email', filter.email.trim());
    } else if (filter.id) {
      if (!isUuid(filter.id)) return null;
      query = query.eq('id', filter.id);
    } else {
      return null;
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn('[Supabase findOne error]:', error.message);
      return null;
    }
    return data ? rowToUser(data as UserRow) : null;
  },

  /**
   * Find a user by UUID id
   */
  async findById(id: string): Promise<IUser | null> {
    return this.findOne({ id });
  },

  /**
   * Create a new student user
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) {
      throw new Error('Supabase is not connected');
    }

    const rowData = userToRow(userData);
    const { data, error } = await supabase
      .from('users')
      .insert([rowData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return rowToUser(data as UserRow);
  },

  /**
   * Update student profile fields by user ID
   */
  async findByIdAndUpdate(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    if (!isUuid(id)) return null;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const rowUpdates = userToRow(updates);
    const { data, error } = await supabase
      .from('users')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase findByIdAndUpdate error]:', error.message);
      return null;
    }
    return data ? rowToUser(data as UserRow) : null;
  }
};
