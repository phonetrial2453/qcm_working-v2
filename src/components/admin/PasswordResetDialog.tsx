import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
  };
}

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!user) return;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.functions.invoke('resetUserPassword', {
        body: { 
          userId: user.id,
          newPassword: newPassword
        }
      });

      if (error) throw error;

      toast.success(`Password reset successfully for ${user.raw_user_meta_data?.name || user.email}`);
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Reset password for {user?.raw_user_meta_data?.name || user?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isResetting}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isResetting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isResetting}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={isResetting}>
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};