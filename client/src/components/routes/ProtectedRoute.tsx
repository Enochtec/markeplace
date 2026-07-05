import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export default function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === 'ADMIN' ? '/admin/dashboard' :
      user.role === 'SHOP_OWNER' ? '/shop/dashboard' : '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
