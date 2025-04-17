import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate password
      if (!password || password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'moderator') => {
    setIsLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@example.com' : 'moderator@example.com';
      const demoPassword = role === 'admin' ? 'adminpass' : 'moderatorpass';
      
      const success = await login(demoEmail, demoPassword);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('An error occurred during demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center islamic-pattern p-4">
      <div className="w-full max-w-md">
        <Card className="border-islamic-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              <span className="text-islamic-primary">Quran & Seerat</span>
              <span className="text-islamic-accent"> Scribe</span>
            </CardTitle>
            <CardDescription>
              Login to manage applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="text-xs p-0 h-auto text-islamic-primary" type="button">
                    Forgot Password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-islamic-primary hover:bg-islamic-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Login</span>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 border-islamic-accent text-islamic-accent hover:text-islamic-accent hover:bg-islamic-accent/10"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
              >
                Admin Demo
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-islamic-secondary text-islamic-secondary hover:text-islamic-secondary hover:bg-islamic-secondary/10"
                onClick={() => handleDemoLogin('moderator')}
                disabled={isLoading}
              >
                Moderator Demo
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
