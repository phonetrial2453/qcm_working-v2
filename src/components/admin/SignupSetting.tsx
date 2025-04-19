
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const SignupSetting: React.FC = () => {
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSignupSetting();
  }, []);

  const fetchSignupSetting = async () => {
    try {
      setIsLoading(true);
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
      toast.error('Failed to load signup setting');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignupSetting = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('app_settings')
        .update({ value: enabled })
        .eq('key', 'signup_enabled');

      if (error) throw error;
      
      setSignupEnabled(enabled);
      toast.success(`Sign up ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating signup setting:', error);
      toast.error('Failed to update signup setting');
      // Revert UI state on error
      setSignupEnabled(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up Settings</CardTitle>
        <CardDescription>
          Control whether new users can sign up for the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="signup-enabled"
            checked={signupEnabled}
            onCheckedChange={updateSignupSetting}
            disabled={isLoading}
          />
          <Label htmlFor="signup-enabled">
            {signupEnabled ? 'Sign up is enabled' : 'Sign up is disabled'}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {signupEnabled 
            ? 'New users can register through the sign up page.'
            : 'New users cannot register. Only admins can create new accounts.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default SignupSetting;
