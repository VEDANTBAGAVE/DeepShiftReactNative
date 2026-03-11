import { supabase } from './supabase';

export interface DBMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: string; name: string; role: string };
}

export const messageService = {
  /**
   * Send a message from sender to receiver
   */
  sendMessage: async (
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<DBMessage> => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, content })
      .select('*, sender:users!messages_sender_id_fkey(id, name, role)')
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all messages between two users, ordered oldest first
   */
  getMessages: async (
    userId1: string,
    userId2: string,
  ): Promise<DBMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id, name, role)')
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`,
      )
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Mark all messages from a specific sender as read
   */
  markRead: async (senderId: string, receiverId: string): Promise<void> => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);
  },

  /**
   * Get unread message count from a specific sender to a receiver
   */
  getUnreadCount: async (
    senderId: string,
    receiverId: string,
  ): Promise<number> => {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  },
};
