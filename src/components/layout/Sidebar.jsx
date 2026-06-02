import { Link, useLocation } from '@tanstack/react-router';
import { Home, Compass, Plus, Bell, User, Settings, PenSquare, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationCount } from '@/hooks/useNotificationCount';

const navItems = [
  { path: '/', icon: Home, label: 'Beranda' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/notifications', icon: Bell, label: 'Notifikasi', isBell: true },
  { path: '/profile', icon: User, label: 'Profil' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuthStore();
  const unreadCount = useNotificationCount();

  const hidePaths = ['/login'];

  return hidePaths.includes(pathname) ? null : (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col bg-gas-darker border-r border-white/[0.06] w-[72px] lg:w-[240px] transition-all duration-300">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 lg:px-6 h-16 shrink-0 border-b border-white/[0.04]">
        <Flame className="w-7 h-7 text-gas-green shrink-0" />
        <span className="hidden lg:block text-xl font-black italic tracking-tighter">Gas<span className="text-gas-green">Aja!</span></span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 lg:px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`relative flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl font-semibold text-sm transition-all group
                ${isActive ? 'bg-gas-green/10 text-gas-green' : 'text-gray-400 hover:bg-gas-card hover:text-white'}`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-pill" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gas-green rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
              <div className="relative">
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-gas-green' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.isBell && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-gas-orange rounded-full border-2 border-gas-darker flex items-center justify-center text-[9px] font-black text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block truncate">{item.label}</span>
              {item.isBell && unreadCount > 0 && (
                <span className="hidden lg:flex ml-auto bg-gas-orange text-white text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[20px] items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Create buttons */}
        <div className="pt-4 space-y-2 border-t border-white/[0.04] mt-4">
          <Link to="/create-plan"
            className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl bg-gas-green text-gas-darker font-bold text-sm hover:brightness-110 transition-all">
            <Plus className="w-5 h-5 shrink-0 stroke-[3]" />
            <span className="hidden lg:block">Buat Plan</span>
          </Link>
          <Link to="/create-post"
            className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl bg-gas-card text-white font-semibold text-sm border border-gray-800 hover:border-gas-green/30 transition-all">
            <PenSquare className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">Buat Post</span>
          </Link>
        </div>
      </nav>

      {/* User card */}
      {user && (
        <div className="p-2 lg:p-3 border-t border-white/[0.04] shrink-0">
          <Link to="/profile" className="flex items-center gap-3 p-2 lg:p-3 rounded-xl hover:bg-gas-card transition-colors">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random`}
              alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gas-green/30 shrink-0" />
            <div className="hidden lg:block min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.displayName || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
