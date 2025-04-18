import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, Settings, BookOpenCheck } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  // Replace the rpc('get_user_roles') call with a direct query to user_roles table
  const fetchUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Error fetching roles:', roleError);
        return;
      }
      
      if (roleData && roleData.length > 0) {
        // Extract roles from the data
        const roles = roleData.map(r => r.role);
        setUserRoles(roles);
      }
      
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  const isAdmin = userRoles.includes('admin');
  const isModerator = userRoles.includes('moderator');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6 text-islamic-primary">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>View and manage your profile settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You are currently signed in as {user?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Role: {userRoles.join(', ') || 'User'}
              </p>
            </CardContent>
            <Button onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Manage your applications</CardDescription>
            </CardHeader>
            <CardContent>
              View, submit, and track the status of your applications.
            </CardContent>
            <Button onClick={() => navigate('/applications')}>
              <BookOpenCheck className="mr-2 h-4 w-4" />
              View Applications
            </Button>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin</CardTitle>
                <CardDescription>Admin-only functions</CardDescription>
              </CardHeader>
              <CardContent>
                Manage users, classes, and system settings.
              </CardContent>
              <Button onClick={() => navigate('/admin')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Button>
            </Card>
          )}

          {isModerator && (
            <Card>
              <CardHeader>
                <CardTitle>Moderator</CardTitle>
                <CardDescription>Moderator-only functions</CardDescription>
              </CardHeader>
              <CardContent>
                Moderate applications and manage user access.
              </CardContent>
              <Button onClick={() => navigate('/admin')}>
                <Settings className="mr-2 h-4 w-4" />
                Moderator Settings
              </Button>
            </Card>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
