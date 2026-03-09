
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'artist' | 'client' | 'admin';
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for all loading to complete
    if (loading || adminLoading) return;

    // If no user, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // If admin-only route and user is not admin, redirect to appropriate dashboard
    if (adminOnly && !isAdmin) {
      navigate('/login'); // Redirect non-admins away from admin routes
      return;
    }
  }, [user, loading, isAdmin, adminLoading, navigate, adminOnly]);

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // If admin-only route and user is not admin, don't render
  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
