import { Link, useLocation } from '@tanstack/react-router';
import { Home, Compass, Plus, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotificationCount } from '@/hooks/useNotificationCount';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/create-plan', icon: Plus, label: 'Create', isCenter: true },
  { path: '/notifications', icon: Bell, label: 'Notif', isBell: true },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomBar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const unreadCount = useNotificationCount();

  const hidePaths = ['/login', '/create-plan', '/create-post', '/create-story'];

  return hidePaths.includes(pathname) ? null : (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Gradient fade above the bar */}
      <div className="h-6 bg-gradient-to-t from-gas-darker to-transparent pointer-events-none" />

      <div className="bg-gas-darker/95 backdrop-blur-xl border-t border-white/[0.06] px-2 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="max-w-md mx-auto flex items-end justify-around">
          {navItems.map(item => {
            const isActive = pathname === item.path;

            if (item.isCenter) {
              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center -mt-5 relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85, rotate: 90 }}
                    className="w-14 h-14 rounded-2xl bg-gas-green flex items-center justify-center shadow-[0_4px_20px_rgba(0,255,159,0.4)] border-[3px] border-gas-darker"
                  >
                    <Plus className="w-7 h-7 text-gas-darker stroke-[3]" />
                  </motion.div>
                </Link>
              );
            }

            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center py-2 px-3 group relative">
                <motion.div whileTap={{ scale: 0.75 }} className="relative">
                  <item.icon
                    className={`w-6 h-6 transition-all duration-200 ${
                      isActive ? 'text-gas-green' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {item.isBell && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-gas-orange rounded-full border-2 border-gas-darker flex items-center justify-center text-[8px] font-black text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.div>
                <span className={`text-[10px] mt-0.5 font-semibold transition-colors ${
                  isActive ? 'text-gas-green' : 'text-gray-600'
                }`}>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottombar-dot"
                    className="absolute -top-0.5 w-5 h-[3px] rounded-full bg-gas-green"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomBar;
