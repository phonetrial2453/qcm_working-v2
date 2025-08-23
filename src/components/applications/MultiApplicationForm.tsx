import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, AlertTriangle, Check, X } from 'lucide-react';
import { ParsedApplication, parseMultipleApplications } from '@/utils/multiApplicationParser';
import { useDuplicateCheck, DuplicateMatch } from '@/hooks/useDuplicateCheck';
import { useApplicationSubmission } from './hooks/useApplicationSubmission';
import { useApplicationValidation } from './hooks/useApplicationValidation';
import { useApplications } from '@/contexts/ApplicationContext';
import { ApplicationPreview } from './ApplicationPreview';
import { toast } from 'sonner';

interface MultiApplicationFormProps {
  applicationText: string;
  selectedClassCode: string;
}

export const MultiApplicationForm: React.FC<MultiApplicationFormProps> = ({
  applicationText,
  selectedClassCode,
}) => {
  const [applications, setApplications] = useState<ParsedApplication[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duplicateMatches, setDuplicateMatches] = useState<Record<string, DuplicateMatch[]>>({});
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  
  const { classes } = useApplications();
  const { checkForDuplicates } = useDuplicateCheck();
  const { handleSubmit, isSubmitting } = useApplicationSubmission();
  const { validationResult, validateApplication } = useApplicationValidation(selectedClassCode, classes);
  
  // Parse applications when text changes
  useEffect(() => {
    const parseAndCheckDuplicates = async () => {
      if (!applicationText.trim()) {
        setApplications([]);
        setDuplicateMatches({});
        return;
      }

      const parsed = parseMultipleApplications(applicationText);
      setApplications(parsed);
      setCurrentIndex(0);
      
      // Only check duplicates if we have parsed applications
      if (parsed.length > 0 && !isCheckingDuplicates) {
        setIsCheckingDuplicates(true);
        
        try {
          const duplicates: Record<string, DuplicateMatch[]> = {};
          
          for (const app of parsed) {
            const fullName = app.parsedData?.studentDetails?.fullName;
            const email = app.parsedData?.otherDetails?.email;
            const mobile = app.parsedData?.studentDetails?.mobile;
            
            if (fullName || email || mobile) {
              try {
                const matches = await checkForDuplicates(fullName, mobile, email);
                if (matches.length > 0) {
                  duplicates[app.id] = matches;
                }
              } catch (error) {
                console.error('Error checking duplicates for app:', app.id, error);
              }
            }
          }
          
          setDuplicateMatches(duplicates);
        } finally {
          setIsCheckingDuplicates(false);
        }
      }
    };
    
    parseAndCheckDuplicates();
  }, [applicationText]); // Removed checkForDuplicates from dependencies to prevent infinite loop
  
  // Validate current application
  useEffect(() => {
    if (currentApplication?.parsedData) {
      validateApplication(currentApplication.parsedData);
    }
  }, [currentIndex, applications, validateApplication]);
  
  const currentApplication = applications[currentIndex];
  const totalApplications = applications.length;
  
  const handleNext = () => {
    if (currentIndex < totalApplications - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleSubmitCurrent = async () => {
    if (!currentApplication || !selectedClassCode) {
      toast.error('Please select a class and ensure application data is valid');
      return;
    }
    
    const result = await handleSubmit({
      parsedData: currentApplication.parsedData,
      selectedClassCode,
      warnings: validationResult.warnings,
    });
    
    if (result) {
      // Mark as submitted
      setApplications(prev => 
        prev.map(app => 
          app.id === currentApplication.id 
            ? { ...app, status: 'submitted' as const }
            : app
        )
      );
      
      // Move to next application if available
      if (currentIndex < totalApplications - 1) {
        handleNext();
      }
    }
  };
  
  const handleCancelCurrent = () => {
    if (!currentApplication) return;
    
    setApplications(prev => 
      prev.map(app => 
        app.id === currentApplication.id 
          ? { ...app, status: 'cancelled' as const }
          : app
      )
    );
    
    // Move to next application if available
    if (currentIndex < totalApplications - 1) {
      handleNext();
    }
    
    toast.success('Application cancelled');
  };
  
  if (totalApplications === 0) {
    return null;
  }
  
  if (totalApplications === 1) {
    // Single application - use existing preview component
    return (
      <ApplicationPreview
        parsedData={currentApplication.parsedData}
        validationResult={validationResult}
        onSubmit={handleSubmitCurrent}
        isSubmitting={isSubmitting}
        selectedClassCode={selectedClassCode}
      />
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Multiple Applications Found ({totalApplications} total)
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="secondary">
              {currentIndex + 1} of {totalApplications}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === totalApplications - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Application status indicator */}
        <div className="flex items-center space-x-2">
          <Badge 
            variant={
              currentApplication.status === 'submitted' ? 'default' :
              currentApplication.status === 'cancelled' ? 'destructive' :
              'secondary'
            }
          >
            {currentApplication.status === 'submitted' && <Check className="h-3 w-3 mr-1" />}
            {currentApplication.status === 'cancelled' && <X className="h-3 w-3 mr-1" />}
            {currentApplication.status.charAt(0).toUpperCase() + currentApplication.status.slice(1)}
          </Badge>
          
          {currentApplication.parsedData?.studentDetails?.fullName && (
            <span className="text-sm text-muted-foreground">
              {currentApplication.parsedData.studentDetails.fullName}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Duplicate warning */}
        {duplicateMatches[currentApplication.id] && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Duplicate Entry Found!</div>
              {duplicateMatches[currentApplication.id].map((match, index) => (
                <div key={index} className="text-sm mb-2 last:mb-0">
                  <div><strong>Application ID:</strong> {match.applicationId}</div>
                  <div><strong>Student Name:</strong> {match.studentName}</div>
                  <div><strong>Class:</strong> {match.classCode}</div>
                  <div><strong>Status:</strong> {match.status}</div>
                  {match.email && <div><strong>Email:</strong> {match.email}</div>}
                  {match.mobile && <div><strong>Mobile:</strong> {match.mobile}</div>}
                  <div><strong>Created:</strong> {new Date(match.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Application preview */}
        {currentApplication.status === 'pending' && (
          <ApplicationPreview
            parsedData={currentApplication.parsedData}
            validationResult={validationResult}
            onSubmit={handleSubmitCurrent}
            isSubmitting={isSubmitting}
            selectedClassCode={selectedClassCode}
            showActionButtons={false}
          />
        )}
        
        {currentApplication.status !== 'pending' && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-center text-muted-foreground">
              This application has been {currentApplication.status}.
            </p>
          </div>
        )}
        
        {/* Action buttons for current application */}
        {currentApplication.status === 'pending' && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleCancelCurrent}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel This Application
            </Button>
            <Button
              onClick={handleSubmitCurrent}
              disabled={isSubmitting || !validationResult.valid}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Submit This Application
            </Button>
          </div>
        )}
        
        {/* Summary footer */}
        <div className="text-sm text-muted-foreground text-center pt-2 border-t">
          Submitted: {applications.filter(app => app.status === 'submitted').length} | 
          Cancelled: {applications.filter(app => app.status === 'cancelled').length} | 
          Pending: {applications.filter(app => app.status === 'pending').length}
        </div>
      </CardContent>
    </Card>
  );
};