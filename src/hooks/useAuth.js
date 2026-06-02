import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { generateUsername } from '@/utils/slug';

/**
 * Hook that listens to Firebase auth state changes and syncs
 * the authenticated user's profile to Realtime Database.
 *
 * Should be called once at the root layout level.
 */
export const useAuth = () => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        try {
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            const username = generateUsername(currentUser.displayName, currentUser.email);
            await set(userRef, {
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'GasAja User',
              email: currentUser.email,
              username: username,
              avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}&background=random`,
              bio: 'Ayo hangout bareng!',
              followers: 0,
              following: 0,
              createdAt: Date.now()
            });
            // Create username → uid mapping for fast lookup
            await set(ref(db, `usernames/${username}`), currentUser.uid);
          } else {
            // Ensure existing users have a username
            const data = snapshot.val();
            if (!data.username) {
              const username = generateUsername(data.displayName || currentUser.displayName, currentUser.email);
              await set(ref(db, `users/${currentUser.uid}/username`), username);
              await set(ref(db, `usernames/${username}`), currentUser.uid);
            }
          }
        } catch (error) {
          console.error('Error syncing user to RTDB:', error);
        }
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
};
