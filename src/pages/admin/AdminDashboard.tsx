
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCog, 
  FileText, 
  FileCheck, 
  FileClock, 
  FileX, 
  Settings,
  BarChart4
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { applications, classes } = useApplications();
  const navigate = useNavigate();
  
  // Calculate statistics
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
  
  // Calculate class statistics
  const classStatistics = classes.map(cls => {
    const classApplications = applications.filter(app => app.classCode === cls.code);
    return {
      code: cls.code,
      name: cls.name,
      total: classApplications.length,
      approved: classApplications.filter(app => app.status === 'approved').length,
      pending: classApplications.filter(app => app.status === 'pending').length,
      rejected: classApplications.filter(app => app.status === 'rejected').length,
    };
  });

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage classes, applications, and users
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-islamic-blue mr-2" />
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
                <FileCheck className="h-5 w-5 text-green-600 mr-2" />
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
                <FileClock className="h-5 w-5 text-amber-500 mr-2" />
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
                <FileX className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-2xl font-bold">{rejectedApplications}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Moderator Management
              </CardTitle>
              <CardDescription>Add, edit, or remove moderators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage moderator accounts and their class access permissions.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-islamic-primary hover:bg-islamic-primary/90"
                onClick={() => navigate('/admin/moderators')}
              >
                Manage Moderators
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Class Settings
              </CardTitle>
              <CardDescription>Configure classes and criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Update class information, acceptance criteria, and export formats.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-islamic-primary hover:bg-islamic-primary/90"
                onClick={() => navigate('/admin/classes')}
              >
                Manage Classes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 className="h-5 w-5 mr-2" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>Generate detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View analytics and generate reports on applications and acceptance rates.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-islamic-primary hover:bg-islamic-primary/90"
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Class Statistics */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Class Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {classStatistics.map(stat => (
              <Card key={stat.code}>
                <CardHeader className="pb-2">
                  <CardTitle>{stat.name}</CardTitle>
                  <CardDescription>Class Code: {stat.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <span className="font-medium">{stat.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Approved:</span>
                      <span className="font-medium text-green-600">{stat.approved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending:</span>
                      <span className="font-medium text-amber-500">{stat.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rejected:</span>
                      <span className="font-medium text-red-600">{stat.rejected}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/applications?class=${stat.code}`)}
                  >
                    View Applications
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

export default AdminDashboard;
