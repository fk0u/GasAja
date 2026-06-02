import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Hook that returns the real-time unread notification count
 * for the currently authenticated user.
 *
 * @returns {number} Unread notification count
 */
export const useNotificationCount = () => {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const notifsRef = ref(db, `notifications/${user.uid}`);
    return onValue(notifsRef, (snap) => {
      let count = 0;
      if (snap.exists()) {
        snap.forEach((c) => {
          if (!c.val().read) count++;
        });
      }
      setUnreadCount(count);
    });
  }, [user]);

  return unreadCount;
};
