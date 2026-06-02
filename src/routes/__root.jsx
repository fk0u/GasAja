import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import BottomBar from '@/components/layout/BottomBar';
import Sidebar from '@/components/layout/Sidebar';
import ToastContainer from '@/components/ui/ToastContainer';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const RootComponent = () => {
  // Initialize auth listener at root level
  useAuth();
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gas-darker gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gas-green"></div>
        <p className="text-gray-600 text-xs font-bold animate-pulse">Memuat GasAja!...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gas-darker text-white">
        {user && <Sidebar />}

        <main className={user ? 'md:ml-[72px] lg:ml-[240px] transition-all duration-300' : ''}>
          <Outlet />
        </main>

        {user && <BottomBar />}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
