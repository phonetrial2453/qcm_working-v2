
import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  requireAuth = false,
  adminOnly = false
}) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      navigate('/login');
    }

    if (adminOnly && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, requireAuth, adminOnly, navigate, loading]);

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

  // If auth required and not authenticated, don't render anything (will redirect)
  if (requireAuth && !isAuthenticated) {
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
