
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { applications, classes } = useApplications();

  // Debug user roles
  useEffect(() => {
    const debugUserRoles = async () => {
      if (user?.id) {
        console.log('Debugging user roles for:', user.id);
        console.log('Current user object:', user);
        console.log('isAdmin status:', isAdmin);
        
        try {
          // Try to get roles using the RPC function with proper typing
          const { data, error } = await supabase
            .rpc('get_user_roles', { user_id: user.id }) as {
              data: string[] | null;
              error: any;
            };
            
          if (error) {
            console.error('Error calling get_user_roles:', error);
          } else {
            console.log('Roles from get_user_roles:', data);
          }
        } catch (err) {
          console.error('Exception in debugUserRoles:', err);
        }
      }
    };
    
    debugUserRoles();
  }, [user, isAdmin]);

  // Calculate statistics
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  // For moderators, filter classes they have access to
  const accessibleClasses = isAdmin 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

  return (
    <AppLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, <span className="text-islamic-primary">{user?.name}</span>
        </h1>
        
        {/* Debug info for admins */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mb-4 p-4 border border-amber-400 bg-amber-50 rounded-md">
            <h3 className="font-bold">Debug Info:</h3>
            <p>User ID: {user?.id}</p>
            <p>User Role: {user?.role}</p>
            <p>isAdmin: {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-islamic-blue mr-2" />
                <span className="text-2xl font-bold">{totalApplications}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-2xl font-bold">{approvedApplications}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">{pendingApplications}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-2xl font-bold">{rejectedApplications}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-islamic-primary hover:bg-islamic-primary/90">
              <Link to="/applications/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/check-status">
                Check Application Status
              </Link>
            </Button>
            {isAdmin && (
              <Button asChild className="bg-islamic-secondary hover:bg-islamic-secondary/90">
                <Link to="/admin">
                  Admin Panel
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Available Classes */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleClasses.map(cls => (
              <Card key={cls.code}>
                <CardHeader>
                  <CardTitle>{cls.name}</CardTitle>
                  <CardDescription>Class Code: {cls.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cls.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/applications?class=${cls.code}`}>
                      View Applications
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
