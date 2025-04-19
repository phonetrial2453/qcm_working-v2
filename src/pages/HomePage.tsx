
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PublicClassesList from '@/components/home/PublicClassesList';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [signupEnabled, setSignupEnabled] = useState(true);

  useEffect(() => {
    fetchSignupSetting();
  }, []);

  const fetchSignupSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'signup_enabled')
        .single();

      if (error) throw error;
      
      if (data) {
        setSignupEnabled(data.value === true || data.value === 'true');
      }
    } catch (error) {
      console.error('Error fetching signup setting:', error);
      // Default to enabled if there's an error
      setSignupEnabled(true);
    }
  };

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
              <>
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
                
                {signupEnabled && (
                  <Button 
                    asChild
                    size="lg" 
                    variant="outline"
                  >
                    <Link to="/signup">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                )}
              </>
            )}
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
              <CardTitle>Application Management</CardTitle>
              <CardDescription>Comprehensive tools for moderators and administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Moderators and administrators can check application status, process submissions, and manage the entire workflow.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Public Classes List Section */}
        <PublicClassesList />
      </div>
    </AppLayout>
  );
};

export default HomePage;
