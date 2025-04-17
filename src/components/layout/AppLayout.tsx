
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import LoginPage from '@/pages/auth/LoginPage';

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-islamic-primary"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, show login
  if (requireAuth && !isAuthenticated) {
    return <LoginPage />;
  }

  // If admin access is required but user is not an admin, show unauthorized
  if (adminOnly && !isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mt-2 text-gray-600">You do not have permission to access this area.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 px-4 py-8 md:px-6 lg:px-8 pattern-bg">
        {children}
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
