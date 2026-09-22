import { getSupabase, isSupabaseConnected, isUuid } from '../config/supabase';

export interface IConversation {
  id: string;
  userId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const rowToConversation = (row: ConversationRow): IConversation => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const Conversation = {
  async findByUser(userId: string): Promise<IConversation[]> {
    if (!isUuid(userId)) return [];
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Conversation.findByUser error]:', error.message);
      return [];
    }
    return (data || []).map((r) => rowToConversation(r as ConversationRow));
  },

  async findById(id: string): Promise<IConversation | null> {
    if (!isUuid(id)) return null;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Conversation.findById error]:', error.message);
      return null;
    }
    return data ? rowToConversation(data as ConversationRow) : null;
  },

  async create(userId: string, title: string): Promise<IConversation | null> {
    if (!isUuid(userId)) return null;
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title }])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase Conversation.create error]:', error.message);
      return null;
    }
    return rowToConversation(data as ConversationRow);
  },

  async touch(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return;
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id);
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return false;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  },
};
