import { useState, useEffect } from 'react';
import { ref, get, set, remove, runTransaction } from 'firebase/database';
import { db, DB_URL } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { pushNotification } from '@/utils/notifications';
import { useCacheStore } from '@/store/useCacheStore';
import { ArrowLeft, MapPin, Calendar, Users, Grid, Loader2, Heart, MessageCircle, UserPlus, UserMinus, Share2, FileText, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useParams, createFileRoute } from '@tanstack/react-router';
import { VIBE_EMOJI } from '@/lib/constants';

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}h lalu`;
  return `${Math.floor(days / 30)}bln lalu`;
};

const UserProfile = () => {
  const { username } = useParams({ strict: false });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const [profileData, setProfileData] = useState(null);
  const [profileUid, setProfileUid] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. Check Cache first
        let uid = useCacheStore.getState().getUsernameUid(username);
        let data = uid ? useCacheStore.getState().getProfile(uid) : null;

        if (uid && data) {
          setProfileUid(uid);
          setProfileData({ uid, ...data });
          setFollowerCount(data.followers || 0);
          setFollowingCount(data.following || 0);
          setLoading(false);
          // Still fetch follow status in the background
          if (user) {
            get(ref(db, `users/${user.uid}/followingList/${uid}`)).then(followSnap => {
              setIsFollowing(followSnap.exists());
            }).catch(() => {});
          }
        }

        // 2. Fetch/Update username -> uid
        if (!uid) {
          const uidSnap = await get(ref(db, `usernames/${username}`));
          if (!uidSnap.exists()) {
            setLoading(false);
            return;
          }
          uid = uidSnap.val();
          useCacheStore.getState().setUsernameUid(username, uid);
          setProfileUid(uid);
        }

        // If it's the current user, redirect to /profile
        if (user && uid === user.uid) {
          navigate({ to: '/profile', replace: true });
          return;
        }

        // 3. Fetch/Update user data if cache miss or stale
        if (!data) {
          const userSnap = await get(ref(db, `users/${uid}`));
          if (userSnap.exists()) {
            data = userSnap.val();
            useCacheStore.getState().setProfile(uid, data);
            setProfileData({ uid, ...data });
            setFollowerCount(data.followers || 0);
            setFollowingCount(data.following || 0);
          }
        }

        // Check follow status (if not set by cache)
        if (user) {
          const followSnap = await get(ref(db, `users/${user.uid}/followingList/${uid}`));
          setIsFollowing(followSnap.exists());
        }

        // Fetch plans by this user
        const plansRes = await fetch(`${DB_URL}/plans.json`);
        const plansData = await plansRes.json();
        if (plansData) {
          const plans = Object.entries(plansData)
            .map(([k, v]) => ({ id: k, ...v }))
            .filter(p => p.creatorId === uid)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setUserPlans(plans);
        }

        // Fetch posts by this user
        const postsRes = await fetch(`${DB_URL}/posts.json`);
        const postsData = await postsRes.json();
        if (postsData) {
          const posts = Object.entries(postsData)
            .map(([k, v]) => ({ id: k, ...v }))
            .filter(p => p.userId === uid)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setUserPosts(posts);
        }
      } catch (e) {
        console.error('Error fetching user profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, user, navigate]);

  const handleFollow = async () => {
    if (!user || !profileUid) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await remove(ref(db, `users/${user.uid}/followingList/${profileUid}`));
        await remove(ref(db, `users/${profileUid}/followersList/${user.uid}`));
        // Decrement counts via transaction
        await runTransaction(ref(db, `users/${profileUid}/followers`), (current) => Math.max((current || 0) - 1, 0));
        await runTransaction(ref(db, `users/${user.uid}/following`), (current) => Math.max((current || 0) - 1, 0));
        setIsFollowing(false);
        setFollowerCount(c => Math.max(c - 1, 0));
        addToast(`Unfollow @${username}`, 'info');
      } else {
        // Follow
        await set(ref(db, `users/${user.uid}/followingList/${profileUid}`), true);
        await set(ref(db, `users/${profileUid}/followersList/${user.uid}`), true);
        await runTransaction(ref(db, `users/${profileUid}/followers`), (current) => (current || 0) + 1);
        await runTransaction(ref(db, `users/${user.uid}/following`), (current) => (current || 0) + 1);
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
        addToast(`Mengikuti @${username} ✅`, 'success');
        // Send notification
        pushNotification(profileUid, {
          type: 'follow', fromName: user.displayName || 'Seseorang',
          fromAvatar: user.photoURL || '', text: 'mulai mengikuti kamu 🎉',
          link: '/',
        });
      }
    } catch (e) {
      console.error('Follow error:', e);
      addToast('Gagal, coba lagi', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Link profil disalin! 🔗', 'success');
    }).catch(() => addToast('Gagal menyalin link', 'error'));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gas-darker">
      <Loader2 className="w-10 h-10 animate-spin text-gas-green" />
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gas-darker gap-4 px-6">
      <div className="w-20 h-20 bg-gas-card rounded-full flex items-center justify-center border border-gray-800">
        <Users className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-white font-black text-xl">User tidak ditemukan</p>
      <p className="text-gray-500 text-sm">@{username} tidak ada di GasAja!</p>
      <Link to="/" className="mt-4 px-6 py-3 bg-gas-green text-gas-darker font-bold rounded-2xl">Ke Beranda</Link>
    </div>
  );

  const totalPosts = userPlans.length + userPosts.length;
  const memberSince = profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen pb-24 md:pb-8 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto bg-gas-darker">
      <header className="sticky top-0 z-50 glass-dock rounded-none border-t-0 border-x-0 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate({ to: -1 })} className="p-2 bg-gas-card rounded-full border-2 border-gray-700 hover:border-gas-green/30 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-white truncate">{profileData.displayName}</h1>
          <p className="text-xs text-gray-500 font-bold">@{profileData.username || username}</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="p-2.5 bg-gas-card rounded-full border border-gray-700 hover:border-gas-green/30 transition-colors">
          <Share2 className="w-4 h-4 text-gray-400" />
        </motion.button>
      </header>

      {/* Profile Header — Premium Bento Card */}
      <div className="px-5 pt-4 pb-2">
        <div className="bento-card relative overflow-hidden bg-gradient-to-br from-gas-card to-gray-900 border-none shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-gas-green/20 to-gas-orange/20 blur-2xl" />
          
          <div className="relative z-10 flex items-start gap-4 mb-4">
            <img
              src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.displayName}&background=random`}
              alt=""
              className="w-20 h-20 rounded-full border-[3px] border-gas-green object-cover shadow-xl"
            />
            <div className="flex-1 grid grid-cols-3 text-center pt-2">
              <div>
                <p className="font-black text-white text-xl">{totalPosts}</p>
                <p className="text-[10px] text-gray-500 font-bold">Posts</p>
              </div>
              <div>
                <p className="font-black text-white text-xl">{followerCount}</p>
                <p className="text-[10px] text-gray-500 font-bold">Followers</p>
              </div>
              <div>
                <p className="font-black text-white text-xl">{followingCount}</p>
                <p className="text-[10px] text-gray-500 font-bold">Following</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="font-black text-white text-lg">{profileData.displayName}</h2>
            <p className="text-gas-green font-bold text-sm">@{profileData.username || username}</p>
            <p className="text-gray-300 text-sm mt-1 mb-1">{profileData.bio || 'Belum ada bio'}</p>
            <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium mb-4">
              {profileData.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gas-orange" />{profileData.location}</span>
              )}
              {memberSince && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gas-green" />Sejak {memberSince}</span>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isFollowing
                    ? 'bg-gas-card border-2 border-gray-700 text-white hover:border-red-500/50 hover:text-red-400'
                    : 'bg-gas-green text-gas-darker hover:brightness-110'
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <><UserMinus className="w-4 h-4" /> Mengikuti</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Follow</>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addToast('Fitur pesan segera hadir! 💬', 'info')}
                className="px-5 py-2.5 bg-gas-card border-2 border-gray-700 rounded-xl font-bold text-sm text-white hover:border-gas-green/30 transition-colors"
              >
                Pesan
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-4 mt-2">
        {[
          { key: 'plans', label: `Plans (${userPlans.length})`, icon: Grid },
          { key: 'posts', label: `Posts (${userPosts.length})`, icon: FileText },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center font-bold text-sm transition-colors relative flex items-center justify-center gap-2 ${activeTab === tab.key ? 'text-white' : 'text-gray-500'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.key && <motion.div layoutId="userprofile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gas-green rounded-full" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'plans' && (
            <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {userPlans.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gas-card rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-700">
                    <Grid className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-500 font-bold">Belum ada plan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userPlans.map(plan => (
                    <Link key={plan.id} to={`/${profileData.username || username}/${plan.slug || plan.id}`}
                      className="rounded-2xl overflow-hidden border border-white/[0.04] bg-gas-card/40 hover:border-gas-green/20 transition-all group">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=60'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <div className="p-3">
                        <span className="text-[9px] bg-gas-orange/20 text-gas-orange px-1.5 py-0.5 rounded font-bold">{VIBE_EMOJI[plan.vibe] || '✨'} {(plan.vibe || '').toUpperCase()}</span>
                        <h3 className="font-bold text-white text-xs line-clamp-2 mt-1">{plan.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-medium">
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{plan.date}</span>
                          <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{plan.participants?.length || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'posts' && (
            <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {userPosts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gas-card rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-700">
                    <FileText className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-500 font-bold">Belum ada post</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPosts.map(post => (
                    <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card">
                      <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                      {post.image && <img src={post.image} alt="" className="w-full rounded-xl mt-3 max-h-60 object-cover" loading="lazy" />}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/50">
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{(post.likes || []).length}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{(post.comments || []).length}</span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium">{timeAgo(post.createdAt)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_auth/$username')({
  component: UserProfile,
});
