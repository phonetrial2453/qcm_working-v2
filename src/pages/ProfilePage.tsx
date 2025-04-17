
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { User, Mail, Key } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // In a real app, this would call an API to update the profile
    // For this demo, we'll just simulate a delay
    setTimeout(() => {
      toast.success('Profile updated successfully');
      setIsUpdating(false);
    }, 1000);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    setIsUpdating(true);
    
    // In a real app, this would call an API to update the password
    setTimeout(() => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdating(false);
    }, 1000);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Profile Settings</h1>
          <p className="text-muted-foreground">
            Update your profile information and password
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user?.role || ''}
                  readOnly
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your role cannot be changed. Contact an administrator for role changes.
                </p>
              </div>
              
              {user?.role === 'moderator' && user.classes && (
                <div className="space-y-2">
                  <Label>Accessible Classes</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.classes.map(classCode => (
                      <div key={classCode} className="bg-islamic-primary/10 text-islamic-primary px-3 py-1 rounded-full text-sm">
                        {classCode}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Class access is managed by administrators.
                  </p>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              onClick={handleProfileUpdate}
              disabled={isUpdating}
              className="ml-auto bg-islamic-primary hover:bg-islamic-primary/90"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  disabled={isUpdating}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Your new password"
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isUpdating}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={isUpdating}
            >
              Reset
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              {isUpdating ? 'Updating...' : 'Change Password'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
