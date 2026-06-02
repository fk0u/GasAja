import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[GasAja] Logout error:', e);
    }
    set({ user: null });
  },
}));
