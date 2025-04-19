import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApplications } from '@/contexts/ApplicationContext';
import SignupSetting from '@/components/admin/SignupSetting';

const AdminDashboard: React.FC = () => {
  const { applications, classes, users } = useApplications();

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-islamic-primary mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Applications</CardTitle>
                <CardDescription>Number of applications received</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{applications.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Classes</CardTitle>
                <CardDescription>Number of classes configured</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{classes.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Number of registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>List of recently submitted applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="py-2 border-b last:border-b-0">
                    {app.student_details?.name} - {app.class_code}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Functionality to manage users will be added here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <SignupSetting />
            
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure application-related settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>More settings will be added here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
