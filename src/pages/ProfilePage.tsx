import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ProfileUpdateForm from '@/components/profile/ProfileUpdateForm';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-islamic-primary mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileUpdateForm />
          <PasswordChangeForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
