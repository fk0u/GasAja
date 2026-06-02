import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Settings, Grid, Bookmark, Edit3, MapPin, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ref, get, update, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('plans');
  const [myPlans, setMyPlans] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', bio: '', avatar: '', username: '' });
  const [savedPlans, setSavedPlans] = useState([]);

  useEffect(() => {
    const fetchMyPlans = async () => {
      if (!user) return;
      try {
        const plansRef = ref(db, 'plans');
        const snapshot = await get(plansRef);
        
        let fetchedPlans = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const planData = childSnapshot.val();
            // Check if user is a participant
            if (planData.participants && planData.participants.includes(user.uid)) {
              fetchedPlans.push({
                id: childSnapshot.key,
                ...planData
              });
            }
          });
        }
        
        fetchedPlans.sort((a, b) => b.createdAt - a.createdAt);
        setMyPlans(fetchedPlans);
      } catch (error) {
        console.error('Error fetching user plans:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          setEditData({
            displayName: data.displayName || user.displayName || '',
            bio: data.bio || '',
            avatar: data.avatar || user.photoURL || '',
            username: data.username || ''
          });
        } else {
          setEditData({
            displayName: user.displayName || '',
            bio: '',
            avatar: user.photoURL || '',
            username: ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchMyPosts = async () => {
      if (!user) return;
      try {
        const postsRef = ref(db, 'posts');
        const snapshot = await get(postsRef);
        let fetched = [];
        if (snapshot.exists()) {
          snapshot.forEach(c => {
            const d = c.val();
            if (d.userId === user.uid) fetched.push({ id: c.key, ...d });
          });
        }
        fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMyPosts(fetched);
      } catch (e) { console.error(e); }
    };

    const fetchSavedPlans = async () => {
      if (!user) return;
      try {
        const savedRef = ref(db, `users/${user.uid}/savedPlans`);
        const savedSnap = await get(savedRef);
        if (savedSnap.exists()) {
          const savedIds = Object.keys(savedSnap.val());
          const plansRef = ref(db, 'plans');
          const plansSnap = await get(plansRef);
          let fetched = [];
          if (plansSnap.exists()) {
            plansSnap.forEach(c => {
              if (savedIds.includes(c.key)) fetched.push({ id: c.key, ...c.val() });
            });
          }
          setSavedPlans(fetched);
        }
      } catch (e) { console.error(e); }
    };

    fetchMyPlans();
    fetchMyPosts();
    fetchUserData();
    fetchSavedPlans();
  }, [user]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const userRef = ref(db, `users/${user.uid}`);
      // If username changed, update the usernames index
      if (editData.username && editData.username !== userData?.username) {
        // Check if new username is taken
        const existCheck = await get(ref(db, `usernames/${editData.username}`));
        if (existCheck.exists() && existCheck.val() !== user.uid) {
          addToast(`Username @${editData.username} sudah dipakai!`, 'error');
          return;
        }
        // Remove old username mapping
        if (userData?.username) {
          await remove(ref(db, `usernames/${userData.username}`));
        }
        // Set new username mapping
        await set(ref(db, `usernames/${editData.username}`), user.uid);
      }
      await update(userRef, editData);
      setUserData({ ...userData, ...editData });
      setShowEditModal(false);
      addToast('Profil berhasil diperbarui! ✨', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Gagal memperbarui profil', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-8 bg-gas-darker md:px-0 max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
      
      {/* Header & Avatar Bento */}
      <div className="p-5">
        <div className="bento-card relative overflow-hidden bg-gradient-to-br from-gas-card to-gray-900 border-none shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gas-orange to-gas-green opacity-20"></div>
           
           <div className="flex justify-between items-start relative z-10 mb-4">
             <img 
               src={userData?.avatar || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} 
               alt="Profile" 
               className="w-24 h-24 rounded-full border-4 border-gas-darker object-cover shadow-xl"
             />
             <button onClick={() => navigate({ to: '/settings' })} className="p-2 bg-gas-darker rounded-full border border-gray-700 text-gray-400 hover:text-white transition-colors">
               <Settings className="w-5 h-5" />
             </button>
           </div>
           
           <div className="relative z-10">
             <h2 className="text-2xl font-black text-white">{userData?.displayName || user?.displayName || 'GasAja User'}</h2>
             {userData?.username && <p className="text-gas-green font-bold text-sm">@{userData.username}</p>}
             <p className="text-gray-400 font-medium text-sm mb-2">{user?.email}</p>
             <p className="text-gray-300 text-sm mb-4 line-clamp-2">{userData?.bio || 'Belum ada bio. Ayo tambahkan bio kamu!'}</p>
             <button onClick={() => setShowEditModal(true)} className="w-full py-2.5 bg-gas-darker border-2 border-gray-700 rounded-xl font-bold text-sm text-white hover:border-gas-green transition-colors flex items-center justify-center gap-2">
               <Edit3 className="w-4 h-4" /> Edit Profile
             </button>
           </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-6">
        <div className="bento-card text-center py-4">
          <p className="text-2xl font-black text-white">{myPlans.length}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Plans</p>
        </div>
        <div className="bento-card text-center py-4">
          <p className="text-2xl font-black text-white">{userData?.followers || 0}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Followers</p>
        </div>
        <div className="bento-card text-center py-4">
          <p className="text-2xl font-black text-white">{userData?.following || 0}</p>
          <p className="text-xs font-bold text-gray-500 mt-1">Following</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-4 px-2">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${activeTab === 'plans' ? 'text-white' : 'text-gray-500'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Grid className="w-4 h-4" /> Plans
          </div>
          {activeTab === 'plans' && (
            <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-1 bg-gas-green rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${activeTab === 'posts' ? 'text-white' : 'text-gray-500'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Posts
          </div>
          {activeTab === 'posts' && (
            <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-1 bg-gas-green rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors relative ${activeTab === 'saved' ? 'text-white' : 'text-gray-500'}`}
        >
           <div className="flex items-center justify-center gap-2">
            <Bookmark className="w-4 h-4" /> Saved
          </div>
          {activeTab === 'saved' && (
            <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-1 bg-gas-green rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="px-5">
        {activeTab === 'plans' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
             {loading ? (
                <div className="col-span-2 text-center py-10 text-gas-green animate-pulse">Loading plans...</div>
             ) : myPlans.length > 0 ? (
                myPlans.map(plan => (
                  <Link to={`/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`} key={plan.id} className="aspect-square rounded-2xl bg-gray-800 relative overflow-hidden group">
                     <img src={plan.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80'} alt="Plan" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-gas-darker to-transparent flex flex-col justify-end p-3">
                       <span className="text-white font-bold text-sm leading-tight mb-1">{plan.title}</span>
                       <span className="text-gray-300 font-bold text-xs flex items-center gap-1"><MapPin className="w-3 h-3 text-gas-green"/> {plan.location}</span>
                     </div>
                  </Link>
                ))
             ) : (
                <div className="col-span-2 text-center py-10 text-gray-500 font-bold">
                  Belum ada plan.
                </div>
             )}
          </div>
        )}
        
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {myPosts.length > 0 ? myPosts.map(post => (
              <div key={post.id} className="bento-card">
                <p className="text-gray-200 text-sm mb-2">{post.content}</p>
                {post.image && <img src={post.image} alt="" className="w-full rounded-xl object-cover max-h-48 mb-2" />}
                <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                  <span>❤️ {(post.likes || []).length}</span>
                  <span>💬 {(post.comments || []).length}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500 font-bold">Belum ada post.</div>
            )}
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div>
            {savedPlans.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {savedPlans.map(plan => (
                  <Link to={`/${plan.creatorUsername || 'u'}/${plan.slug || plan.id}`} key={plan.id} className="aspect-square rounded-2xl bg-gray-800 relative overflow-hidden group">
                    <img src={plan.coverImage || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80'} alt="Plan" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gas-darker to-transparent flex flex-col justify-end p-3">
                      <span className="text-white font-bold text-sm leading-tight mb-1">{plan.title}</span>
                      <span className="text-gray-300 font-bold text-xs flex items-center gap-1"><MapPin className="w-3 h-3 text-gas-green"/> {plan.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gas-card rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-700">
                  <Bookmark className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-400 font-bold">Belum ada plan yang disimpan.</p>
                <p className="text-gray-600 text-sm mt-1">Tap ikon bookmark di plan untuk menyimpan.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-5 mt-8">
        <button 
          onClick={() => { logout(); addToast('Berhasil logout! Sampai jumpa 👋', 'info'); }}
          className="w-full py-4 rounded-2xl border-2 border-red-500/30 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gas-darker border-t border-gray-800 rounded-t-[40px] p-6 pb-12 w-full max-w-xl mx-auto flex flex-col h-[75vh]"
            >
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 shrink-0" />
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-2xl font-black text-white">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 bg-gas-card rounded-full"><Settings className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form id="edit-profile-form" onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nama Tampilan</label>
                    <input type="text" value={editData.displayName} onChange={e => setEditData({...editData, displayName: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gas-green font-bold text-sm">@</span>
                      <input type="text" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 pl-9 text-white font-bold focus:border-gas-green outline-none" placeholder="username" />
                    </div>
                    <p className="text-[10px] text-gray-600 mt-1 px-1">Hanya huruf kecil, angka, dan underscore</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
                    <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} rows="3" className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none resize-none" placeholder="Tuliskan bio kerenmu..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">URL Avatar / Foto Profil</label>
                    <input type="url" value={editData.avatar} onChange={e => setEditData({...editData, avatar: e.target.value})} className="w-full bg-gas-card border-2 border-gray-800 rounded-xl p-4 text-white font-bold focus:border-gas-orange outline-none" placeholder="https://..." />
                  </div>
                </form>
              </div>
              
              <div className="pt-4 mt-auto">
                <motion.button type="submit" form="edit-profile-form" whileTap={{ scale: 0.95 }} className="w-full bg-gas-green text-gas-darker font-black text-xl py-4 rounded-2xl">
                  Simpan Profil
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export const Route = createFileRoute('/_auth/profile')({
  component: Profile,
});
