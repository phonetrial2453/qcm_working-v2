
import React, { useState, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseApplicationText } from '@/utils/applicationValidation';
import ValidationWarnings from './ValidationWarnings';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PreviewFields from './PreviewFields';
import { supabase } from '@/integrations/supabase/client';
import { generateSimpleApplicationId } from '@/utils/applicationIdGenerator';

const NewApplicationForm: React.FC = () => {
  const { classes, createApplication } = useApplications();
  const [selectedClassCode, setSelectedClassCode] = useState<string>('');
  const [applicationText, setApplicationText] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: false, warnings: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedClassCode) {
      const selectedClass = classes.find(c => c.code === selectedClassCode);
      if (selectedClass?.template) {
        setSelectedTemplate(selectedClass.template);
      } else {
        setSelectedTemplate('');
      }
    }
  }, [selectedClassCode, classes]);

  useEffect(() => {
    if (applicationText.trim()) {
      const parsed = parseApplicationText(applicationText);
      setParsedData(parsed);
      
      if (parsed) {
        validateApplication(parsed);
      }
    } else {
      setParsedData(null);
      setValidationResult({ valid: false, warnings: [] });
    }
  }, [applicationText]);

  const validateApplication = async (data: any) => {
    const warnings: { field: string; message: string }[] = [];
    
    const requiredFields = [
      { path: 'studentDetails.fullName', label: 'Student Name' },
      { path: 'studentDetails.mobile', label: 'Mobile Number' },
      { path: 'otherDetails.email', label: 'Email Address' },
    ];
    
    requiredFields.forEach(field => {
      const value = getNestedValue(data, field.path);
      if (!value) {
        warnings.push({ field: field.label, message: `${field.label} is required` });
      }
    });
    
    if (selectedClassCode) {
      const selectedClass = classes.find(c => c.code === selectedClassCode);
      
      if (selectedClass?.validationRules) {
        if (selectedClass.validationRules.ageRange && data.otherDetails?.age) {
          const age = parseInt(data.otherDetails.age);
          const minAge = selectedClass.validationRules.ageRange.min;
          const maxAge = selectedClass.validationRules.ageRange.max;
          
          if (minAge && age < minAge) {
            warnings.push({ 
              field: 'Age', 
              message: `Age must be at least ${minAge} years`
            });
          }
          
          if (maxAge && age > maxAge) {
            warnings.push({ 
              field: 'Age', 
              message: `Age must not exceed ${maxAge} years`
            });
          }
        }
        
        if (selectedClass.validationRules.allowedStates && 
            selectedClass.validationRules.allowedStates.length > 0 && 
            data.currentResidence?.state) {
          const state = data.currentResidence.state.toLowerCase();
          const allowedStates = selectedClass.validationRules.allowedStates.map(s => s.toLowerCase());
          
          if (!allowedStates.some(s => state.includes(s))) {
            warnings.push({ 
              field: 'Current State', 
              message: `State must be one of: ${selectedClass.validationRules.allowedStates.join(', ')}`
            });
          }
        }
        
        if (selectedClass.validationRules.minimumQualification && data.otherDetails?.qualification) {
          const qualification = data.otherDetails.qualification.toLowerCase();
          const minQualification = selectedClass.validationRules.minimumQualification.toLowerCase();
          
          if (!qualification.includes(minQualification)) {
            warnings.push({ 
              field: 'Qualification', 
              message: `Qualification must be at least ${selectedClass.validationRules.minimumQualification}`
            });
          }
        }
      }
      
      if (data.studentDetails?.fullName && data.studentDetails?.mobile) {
        try {
          const { data: existingApps, error } = await supabase
            .from('applications')
            .select('id, student_details')
            .eq('class_code', selectedClassCode)
            .not('status', 'eq', 'rejected');
          
          if (error) throw error;
          
          const duplicates = existingApps.filter(app => {
            const studentDetails = app.student_details as any;
            return (
              studentDetails?.fullName?.toLowerCase() === data.studentDetails.fullName.toLowerCase() &&
              studentDetails?.mobile === data.studentDetails.mobile
            );
          });
          
          if (duplicates.length > 0) {
            warnings.push({ 
              field: 'Duplicate Application', 
              message: 'An application with this name and mobile number already exists'
            });
          }
        } catch (error) {
          console.error('Error checking for duplicates:', error);
        }
      }
    }
    
    setValidationResult({
      valid: warnings.length === 0,
      warnings
    });
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  const handleClassChange = (value: string) => {
    setSelectedClassCode(value);
  };

  const handleSubmit = async () => {
    if (!parsedData || !selectedClassCode) {
      toast.error('Please select a class and enter valid application data');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current count of applications for this class to generate the next ID
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('class_code', selectedClassCode);
      
      const currentCount = count || 0;
      const applicationId = generateSimpleApplicationId(selectedClassCode, currentCount);
      
      const applicationData = {
        id: applicationId,
        classCode: selectedClassCode,
        status: 'pending',
        studentDetails: parsedData.studentDetails || {},
        otherDetails: parsedData.otherDetails || {},
        hometownDetails: parsedData.hometownDetails || {},
        currentResidence: parsedData.currentResidence || {},
        referredBy: parsedData.referredBy || {},
        remarks: `Auto-created application with ${validationResult.warnings.length} validation warnings`,
      };
      
      const result = await createApplication(applicationData);
      
      if (result) {
        toast.success(`Application submitted successfully. ID: ${applicationId}`);
        navigate('/applications');
      } else {
        toast.error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTemplate = () => {
    if (selectedTemplate) {
      navigator.clipboard.writeText(selectedTemplate)
        .then(() => toast.success('Template copied to clipboard'))
        .catch(() => toast.error('Failed to copy template'));
    } else {
      toast.error('No template available for this class');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApplicationText(text);
    } catch (error) {
      toast.error('Unable to paste from clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Application</CardTitle>
          <CardDescription>
            Create a new application by pasting formatted text data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class">Select Class</Label>
            <Select value={selectedClassCode} onValueChange={handleClassChange}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.code} value={classItem.code}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassCode && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyTemplate} 
                disabled={!selectedTemplate}
              >
                Copy Template
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="applicationText">Paste Application Text</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePaste}
              >
                Paste from Clipboard
              </Button>
            </div>
            <Textarea
              id="applicationText"
              placeholder="Paste the application text here..."
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Review the parsed application data before submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreviewFields data={parsedData} />
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <ValidationWarnings warnings={validationResult.warnings} />
            <div className="flex justify-end w-full">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !selectedClassCode || !parsedData}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default NewApplicationForm;
