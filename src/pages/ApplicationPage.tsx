
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { z } from 'zod';

const ApplicationPage = () => {
  const navigate = useNavigate();
  const [applicationText, setApplicationText] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateApplicationText = () => {
    const errors: string[] = [];
    
    // Check if applicationText is empty
    if (!applicationText.trim()) {
      errors.push('Application text is required');
      return errors;
    }
    
    // Check for required sections
    const requiredSections = [
      'STUDENT DETAILS',
      'HOMETOWN DETAILS',
      'CURRENT RESIDENCE',
      'OTHER DETAILS',
      'REFERRED By'
    ];
    
    for (const section of requiredSections) {
      if (!applicationText.includes(section)) {
        errors.push(`Missing section: ${section}`);
      }
    }
    
    // Validate email format if present
    const emailRegex = /Email Address[\s]*:[\s]*([^\n]*)/;
    const emailMatch = applicationText.match(emailRegex);
    
    if (emailMatch && emailMatch[1]) {
      const email = emailMatch[1].trim();
      const emailSchema = z.string().email({ message: 'Invalid email format' });
      try {
        emailSchema.parse(email);
      } catch (error) {
        errors.push('Invalid email format');
      }
    } else {
      errors.push('Email Address is required');
    }
    
    // Check for class code format at the beginning (e.g., TSAP)
    const firstLine = applicationText.split('\n')[0].trim();
    const codeRegex = /^[A-Z]{2,10}$/;
    
    if (!codeRegex.test(firstLine)) {
      errors.push('Application must start with a valid class code (2-10 uppercase letters)');
    }
    
    // Check for required fields
    const requiredFields = [
      'Full Name',
      'Mobile#',
      'Age',
      'Qualification'
    ];
    
    for (const field of requiredFields) {
      const fieldRegex = new RegExp(`${field}[\s]*:[\s]*([^\n]*)`);
      const match = applicationText.match(fieldRegex);
      
      if (!match || !match[1].trim()) {
        errors.push(`${field} is required`);
      }
    }
    
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateApplicationText();
    setFormErrors(errors);
    
    if (errors.length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    // Here you would normally submit the application to your backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      toast.success('Application submitted successfully');
      setIsSubmitting(false);
      navigate('/');
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-3xl py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">Application</h1>
          <p className="text-muted-foreground">Submit your application for Quran classes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Please paste the completed application text below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formErrors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Please fix the following errors:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="applicationText">Application Text</Label>
              <Textarea 
                id="applicationText" 
                placeholder="Paste your application text here..." 
                rows={15} 
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Make sure your application includes all required sections and fields.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button 
                className="bg-islamic-primary hover:bg-islamic-primary/90"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ApplicationPage;
