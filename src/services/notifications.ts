import { supabase } from '../lib/supabase';
import { debug, Category } from '../lib/debug';

const COMPONENT_ID = 'NotificationService';

export type NotificationType = 'rate' | 'system' | 'alert';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
}

export async function createNotification(data: NotificationData) {
  try {
    debug.logInfo(Category.API, 'Creating notification', { data }, COMPONENT_ID);
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type
      });

    if (error) throw error;
  } catch (err) {
    debug.logError(Category.API, 'Error creating notification', {}, err, COMPONENT_ID);
    throw err;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    debug.logInfo(Category.API, 'Marking notification as read', { notificationId }, COMPONENT_ID);
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    debug.logError(Category.API, 'Error marking notification as read', {}, err, COMPONENT_ID);
    throw err;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    debug.logInfo(Category.API, 'Deleting notification', { notificationId }, COMPONENT_ID);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    debug.logError(Category.API, 'Error deleting notification', {}, err, COMPONENT_ID);
    throw err;
  }
}

export function subscribeToNotifications(userId: string, onNotification: (notification: any) => void) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => onNotification(payload.new)
    )
    .subscribe();
}