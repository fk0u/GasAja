import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Auth guard layout route.
 * All routes under _auth/ require authentication.
 * Unauthenticated users are redirected to /login.
 */
const AuthLayout = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});
