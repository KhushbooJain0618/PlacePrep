import { getSupabase, isSupabaseConnected } from '../config/supabase';

export interface IMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[] | null;
  createdAt?: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: string[] | null;
  created_at: string;
}

const rowToMessage = (row: MessageRow): IMessage => ({
  id: row.id,
  conversationId: row.conversation_id,
  role: row.role,
  content: row.content,
  sources: row.sources,
  createdAt: row.created_at,
});

export const Message = {
  async findByConversation(conversationId: string): Promise<IMessage[]> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase Message.findByConversation error]:', error.message);
      return [];
    }
    return (data || []).map((r) => rowToMessage(r as MessageRow));
  },

  async create(data: {
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
  }): Promise<IMessage | null> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConnected()) return null;

    const { data: row, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: data.conversationId,
        role: data.role,
        content: data.content,
        sources: data.sources || null,
      }])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase Message.create error]:', error.message);
      return null;
    }
    return rowToMessage(row as MessageRow);
  },
};
