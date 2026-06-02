import { create } from 'zustand';

export const useCacheStore = create((set, get) => ({
  profiles: {},     // uid -> { data, timestamp }
  plans: null,      // { data, timestamp }
  posts: null,      // { data, timestamp }
  usernames: {},    // username -> uid

  getProfile: (uid) => {
    const entry = get().profiles[uid];
    if (entry && Date.now() - entry.timestamp < 300000) { // 5 minutes cache
      return entry.data;
    }
    return null;
  },

  setProfile: (uid, data) => {
    set((state) => ({
      profiles: {
        ...state.profiles,
        [uid]: { data, timestamp: Date.now() },
      },
    }));
  },

  getUsernameUid: (username) => {
    const entry = get().usernames[username];
    if (entry && Date.now() - entry.timestamp < 300000) { // 5 minutes cache
      return entry.uid;
    }
    return null;
  },

  setUsernameUid: (username, uid) => {
    set((state) => ({
      usernames: {
        ...state.usernames,
        [username]: { uid, timestamp: Date.now() },
      },
    }));
  },

  getPlans: () => {
    const entry = get().plans;
    if (entry && Date.now() - entry.timestamp < 60000) { // 1 minute cache
      return entry.data;
    }
    return null;
  },

  setPlans: (data) => {
    set({ plans: { data, timestamp: Date.now() } });
  },

  getPosts: () => {
    const entry = get().posts;
    if (entry && Date.now() - entry.timestamp < 60000) { // 1 minute cache
      return entry.data;
    }
    return null;
  },

  setPosts: (data) => {
    set({ posts: { data, timestamp: Date.now() } });
  },

  invalidateAll: () => {
    set({ profiles: {}, plans: null, posts: null, usernames: {} });
  },
}));
