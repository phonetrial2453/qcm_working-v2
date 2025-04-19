import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Check, X } from 'lucide-react';
import { StudentApplication } from '@/types/supabase-types';

// Define a type for ParsedApplication
interface ParsedApplication {
  valid: boolean;
  errors: string[];
  warnings: string[];
  studentDetails: {
    fullName: string;
    mobile: string;
    whatsapp?: string;
  };
  hometownDetails: {
    area?: string;
    city: string;
    district: string;
    state: string;
  };
  currentResidence: {
    area: string;
    mandal: string;
    city: string;
    state: string;
  };
  otherDetails: {
    age: number;
    qualification: string;
    profession: string;
    email: string;
  };
  referredBy: {
    fullName: string;
    mobile: string;
    studentId: string;
    batch: string;
  };
}

const NewApplicationPage: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [parsedApplication, setParsedApplication] = useState<Partial<StudentApplication> | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { validateApplication, addApplication, classes } = useApplications();
  const navigate = useNavigate();

  const accessibleClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const parseApplicationText = (text: string, classCode: string): Partial<StudentApplication> => {
    const result: Partial<StudentApplication> = {
      classCode,
      status: 'pending',
      studentDetails: {
        fullName: '',
        mobile: '',
        whatsapp: '',
      },
      hometownDetails: {
        area: '',
        city: '',
        district: '',
        state: '',
      },
      currentResidence: {
        area: '',
        mandal: '',
        city: '',
        state: '',
      },
      otherDetails: {
        age: 0,
        qualification: '',
        profession: '',
        email: '',
      },
      referredBy: {
        fullName: '',
        mobile: '',
        studentId: '',
        batch: '',
      },
    };

    const errors: string[] = [];
    
    // Verify class code in the first line
    const firstLine = text.split('\n')[0].trim();
    if (firstLine !== classCode) {
      errors.push(`Class code in application (${firstLine}) does not match selected class (${classCode})`);
    }

    // Continue with parsing the sections and fields
    const sections = [
      'STUDENT DETAILS',
      'HOMETOWN DETAILS',
      'CURRENT RESIDENCE',
      'OTHER DETAILS',
      'REFERRED By'
    ];

    const extractField = (line: string): [string, string] => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(`Invalid line format: ${line}`);
      }
      const fieldName = line.substring(0, colonIndex).trim();
      const fieldValue = line.substring(colonIndex + 1).trim();
      return [fieldName, fieldValue];
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      if (sections.some(section => trimmedLine.includes(section))) {
        for (const section of sections) {
          if (trimmedLine.includes(section)) {
            currentSection = section;
            break;
          }
        }
        continue;
      }
      
      if (/^={3,}$|^-{3,}$/.test(trimmedLine)) continue;
      
      if (currentSection && trimmedLine.includes(':')) {
        const [fieldName, fieldValue] = extractField(trimmedLine);
        
        switch (currentSection) {
          case 'STUDENT DETAILS':
            if (fieldName.includes('Full Name')) {
              result.studentDetails!.fullName = fieldValue;
              if (!fieldValue) {
                errors.push('Full Name is required');
              }
            } else if (fieldName.includes('Mobile')) {
              result.studentDetails!.mobile = fieldValue;
              if (!fieldValue) {
                errors.push('Mobile Number is required');
              }
            } else if (fieldName.includes('WhatsApp')) {
              result.studentDetails!.whatsapp = fieldValue;
            }
            break;
            
          case 'HOMETOWN DETAILS':
            if (fieldName.includes('Area/Locality')) {
              result.hometownDetails!.area = fieldValue;
            } else if (fieldName.includes('City')) {
              result.hometownDetails!.city = fieldValue;
            } else if (fieldName.includes('District')) {
              result.hometownDetails!.district = fieldValue;
            } else if (fieldName.includes('State')) {
              result.hometownDetails!.state = fieldValue;
            }
            break;
            
          case 'CURRENT RESIDENCE':
            if (fieldName.includes('Area/Locality')) {
              result.currentResidence!.area = fieldValue;
            } else if (fieldName.includes('Mandal')) {
              result.currentResidence!.mandal = fieldValue;
            } else if (fieldName.includes('City')) {
              result.currentResidence!.city = fieldValue;
            } else if (fieldName.includes('State')) {
              result.currentResidence!.state = fieldValue;
            }
            break;
            
          case 'OTHER DETAILS':
            if (fieldName.includes('Age')) {
              result.otherDetails!.age = parseInt(fieldValue, 10) || 0;
              if (!fieldValue || isNaN(parseInt(fieldValue, 10))) {
                errors.push('Age is required and must be a number');
              }
            } else if (fieldName.includes('Qualification')) {
              result.otherDetails!.qualification = fieldValue;
              if (!fieldValue) {
                errors.push('Qualification is required');
              }
            } else if (fieldName.includes('Profession')) {
              result.otherDetails!.profession = fieldValue;
            } else if (fieldName.includes('Email')) {
              result.otherDetails!.email = fieldValue;
              if (!fieldValue) {
                errors.push('Email Address is required');
              } else if (!validateEmail(fieldValue)) {
                errors.push('Invalid email format');
              }
            }
            break;
            
          case 'REFERRED By':
            if (fieldName.includes('Full Name')) {
              result.referredBy!.fullName = fieldValue;
            } else if (fieldName.includes('Mobile')) {
              result.referredBy!.mobile = fieldValue;
            } else if (fieldName.includes('Student ID')) {
              result.referredBy!.studentId = fieldValue;
            } else if (fieldName.includes('Batch')) {
              result.referredBy!.batch = fieldValue;
            }
            break;
        }
      }
    }

    // Validate that all required sections are present
    for (const section of sections) {
      if (!text.includes(section)) {
        errors.push(`Missing section: ${section}`);
      }
    }

    setValidationErrors(errors);
    return result;
  };

  const parseApplication = () => {
    if (!selectedClass) {
      toast.error('Please select a class before parsing the application');
      return;
    }

    if (!rawText.trim()) {
      toast.error('Please enter application text');
      return;
    }
    
    try {
      const parsedApp = parseApplicationText(rawText, selectedClass);
      setParsedApplication(parsedApp);
      
      if (validationErrors.length === 0) {
        toast.success('Application parsed successfully');
      } else {
        toast.error('Application has validation errors');
      }
    } catch (error) {
      console.error('Parsing error:', error);
      toast.error('Failed to parse application. Please check the format.');
    }
  };

  const handleSubmit = async () => {
    if (!parsedApplication) {
      toast.error('Please parse the application before submitting');
      return;
    }

    if (validationErrors.length > 0) {
      toast.error('Cannot submit application with validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      await addApplication(parsedApplication as Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>);
      toast.success('Application submitted successfully');
      navigate('/applications');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setParsedApplication(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">New Application</h1>
          <p className="text-muted-foreground">Submit application for Quran Classes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Paste the application text below. The system will parse and validate the information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="class">Select Class</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {accessibleClasses.map(cls => (
                    <SelectItem key={cls.code} value={cls.code}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-text">Application Text</Label>
              <Textarea
                id="application-text"
                placeholder="Paste the full application text here..."
                rows={15}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Make sure the text follows the required format with sections properly labeled.
              </p>
            </div>

            <Button 
              type="button" 
              onClick={parseApplication}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              Parse Application
            </Button>

            {parsedApplication && (
              <>
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2">
                        {validationErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validationErrors.length === 0 && (
                  <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Application Valid</AlertTitle>
                    <AlertDescription>
                      The application has been successfully parsed and is ready to submit.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Display parsed application details here */}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!parsedApplication || validationErrors.length > 0 || isSubmitting}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewApplicationPage;
