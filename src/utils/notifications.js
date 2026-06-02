import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

/**
 * Push a real-time notification to a user's notification feed.
 * @param {string} targetUserId - Who receives the notification
 * @param {Object} opts
 * @param {string} opts.type - 'like' | 'comment' | 'join' | 'new_plan' | 'new_post'
 * @param {string} opts.fromName - Display name of the actor
 * @param {string} opts.fromAvatar - Avatar URL of the actor
 * @param {string} opts.text - Notification message
 * @param {string} [opts.link] - Optional deep link path
 */
export const pushNotification = async (targetUserId, { type, fromName, fromAvatar, text, link }) => {
  if (!targetUserId) return;
  try {
    const notifsRef = ref(db, `notifications/${targetUserId}`);
    const newRef = push(notifsRef);
    await set(newRef, {
      type,
      fromName: fromName || 'Seseorang',
      fromAvatar: fromAvatar || '',
      text,
      link: link || null,
      read: false,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.error('[GasAja] pushNotification error:', e);
  }
};
