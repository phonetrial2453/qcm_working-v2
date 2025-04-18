
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, LogIn } from 'lucide-react';
import PublicClassesList from '@/components/home/PublicClassesList';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout requireAuth={false}>
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-islamic-primary md:text-5xl lg:text-6xl">
            Quran Classes <span className="text-islamic-accent">Application Manager</span>
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamlined application management system for Quran and Seerat classes
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button 
                asChild
                size="lg" 
                className="bg-islamic-primary hover:bg-islamic-primary/90"
              >
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <Button 
                asChild
                size="lg" 
                className="bg-islamic-primary hover:bg-islamic-primary/90"
              >
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
            <Button 
              asChild
              size="lg" 
              variant="outline"
            >
              <Link to="/check-status">
                <Search className="mr-2 h-4 w-4" />
                Check Application Status
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Streamlined Applications</CardTitle>
              <CardDescription>Easy application submission and tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Submit applications with a simple form process. The system validates data in real-time to ensure accuracy.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Effortless Management</CardTitle>
              <CardDescription>Efficient dashboard for administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Administrators can easily review applications, track status changes, and generate reports.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Status Checks</CardTitle>
              <CardDescription>Easy application status lookup</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Applicants can check their status using their unique application ID, with the option to copy details.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Public Classes List Section */}
        <PublicClassesList />
        
        {/* CTA Section */}
        <div className="rounded-lg bg-islamic-pattern p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-islamic-primary mb-4">
            Check Your Application Status
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have you already applied? Enter your application ID to check your current status.
          </p>
          <Button 
            asChild
            size="lg" 
            className="bg-islamic-accent text-islamic-primary hover:bg-islamic-accent/90"
          >
            <Link to="/check-status">
              <FileText className="mr-2 h-4 w-4" />
              Check Status Now
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default HomePage;
