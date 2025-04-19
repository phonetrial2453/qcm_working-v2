
import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Settings, Database, FileText, Users } from 'lucide-react';
import SignupSetting from '@/components/admin/SignupSetting';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <AppLayout requireAuth={true}>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name || 'Admin'}. Manage the Quran Classes Application system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SignupSetting />

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage moderators and their assigned classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add, remove, or modify moderator privileges and manage their class assignments.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="bg-islamic-primary hover:bg-islamic-primary/90">
                <Link to="/admin/moderators">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Moderators
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Settings</CardTitle>
              <CardDescription>
                Manage class details and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure class names, descriptions, age requirements, and application templates.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="bg-islamic-primary hover:bg-islamic-primary/90">
                <Link to="/admin/classes">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Classes
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Reports</CardTitle>
              <CardDescription>
                Generate and export application data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View statistics and generate reports on applications by class, status, and date.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="bg-islamic-primary hover:bg-islamic-primary/90">
                <Link to="/admin/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check Application Status</CardTitle>
              <CardDescription>
                Search for specific applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Look up the status of any application by student details or application ID.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="bg-islamic-primary hover:bg-islamic-primary/90">
                <Link to="/check-status">
                  <Database className="mr-2 h-4 w-4" />
                  Check Status
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
