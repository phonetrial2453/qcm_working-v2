
import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
  moderatorOrAdmin?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  requireAuth = true, // Default changed to true for all routes
  adminOnly = false,
  moderatorOrAdmin = false
}) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isModerator = user?.role === 'moderator';

  useEffect(() => {
    if (loading) return;

    // Skip auth check for home page
    if (location.pathname === '/' && requireAuth) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (adminOnly && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (moderatorOrAdmin && !isAdmin && !isModerator) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, isAdmin, isModerator, requireAuth, adminOnly, moderatorOrAdmin, navigate, loading, location.pathname]);

  // If loading and auth is required, show loading state
  if (loading && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-islamic-primary border-t-transparent"></div>
      </div>
    );
  }

  // If admin only and user is not admin, don't render anything (will redirect)
  if (adminOnly && !isAdmin) {
    return null;
  }

  // If moderator/admin only and user is neither, don't render (will redirect)
  if (moderatorOrAdmin && !isAdmin && !isModerator) {
    return null;
  }

  // If auth required and not authenticated, don't render anything (will redirect)
  if (requireAuth && !isAuthenticated && location.pathname !== '/') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <main className="flex-grow py-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
