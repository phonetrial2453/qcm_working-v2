
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications, StudentApplication } from '@/contexts/ApplicationContext';
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

const NewApplicationPage: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<StudentApplication> | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { validateApplication, addApplication, classes } = useApplications();
  const navigate = useNavigate();

  // Filter classes based on user access
  const accessibleClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

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
      // Reset previous validation results
      setValidationErrors([]);
      setValidationWarnings([]);

      // Attempt to parse the text
      const parsedApplication = parseApplicationText(rawText, selectedClass);
      
      // Validate the parsed data
      const validationResult = validateApplication(parsedApplication);
      
      if (!validationResult.valid) {
        setValidationErrors(validationResult.errors);
      }

      // Additional warnings checks
      const warnings: string[] = [];
      
      // Check age range
      const age = parsedApplication.otherDetails?.age;
      if (age && (age < 25 || age > 45)) {
        warnings.push(`Age (${age}) is outside the recommended range of 25-45 years`);
      }
      
      // Check qualification
      const qualification = parsedApplication.otherDetails?.qualification || '';
      const graduateKeywords = ['graduate', 'b.', 'bachelor', 'm.', 'master', 'ph.d', 'doctorate'];
      if (!graduateKeywords.some(keyword => qualification.toLowerCase().includes(keyword))) {
        warnings.push('Qualification may not be graduate-level or above');
      }
      
      setValidationWarnings(warnings);
      setParsedData(parsedApplication);
      
      if (validationResult.valid) {
        toast.success('Application parsed successfully');
      }
    } catch (error) {
      console.error('Parsing error:', error);
      toast.error('Failed to parse application. Please check the format.');
    }
  };

  const parseApplicationText = (text: string, classCode: string): Partial<StudentApplication> => {
    // Initialize our result object
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

    // Define the sections we expect in the text
    const sections = [
      'STUDENT DETAILS',
      'HOMETOWN DETAILS',
      'CURRENT RESIDENCE',
      'OTHER DETAILS',
      'REFERRED By'
    ];

    // Helper function to extract field value
    const extractField = (line: string): [string, string] => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        throw new Error(`Invalid line format: ${line}`);
      }
      const fieldName = line.substring(0, colonIndex).trim();
      const fieldValue = line.substring(colonIndex + 1).trim();
      return [fieldName, fieldValue];
    };

    // Split the text into lines
    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Check if this line is a section header
      if (sections.some(section => trimmedLine.includes(section))) {
        for (const section of sections) {
          if (trimmedLine.includes(section)) {
            currentSection = section;
            break;
          }
        }
        continue;
      }
      
      // Skip lines that are just separators
      if (/^={3,}$|^-{3,}$/.test(trimmedLine)) continue;
      
      // Parse fields based on the current section
      if (currentSection && trimmedLine.includes(':')) {
        const [fieldName, fieldValue] = extractField(trimmedLine);
        
        switch (currentSection) {
          case 'STUDENT DETAILS':
            if (fieldName.includes('Full Name')) {
              result.studentDetails!.fullName = fieldValue;
            } else if (fieldName.includes('Mobile')) {
              result.studentDetails!.mobile = fieldValue;
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
            } else if (fieldName.includes('Qualification')) {
              result.otherDetails!.qualification = fieldValue;
            } else if (fieldName.includes('Profession')) {
              result.otherDetails!.profession = fieldValue;
            } else if (fieldName.includes('Email')) {
              result.otherDetails!.email = fieldValue;
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

    return result;
  };

  const handleSubmit = () => {
    if (!parsedData || validationErrors.length > 0) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    if (!parsedData.classCode) {
      toast.error('Please select a class');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the application to our system
      const id = addApplication(parsedData as Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>);
      
      toast.success(`Application submitted successfully with ID: ${id}`);
      navigate(`/applications/${id}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting the application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">New Application</h1>
          <p className="text-muted-foreground">Submit a new application for Quran & Seerat classes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Paste the entire application text below. The system will parse and validate the information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class Selection */}
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

            {/* Application Text */}
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

            {/* Validation Results */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationWarnings.length > 0 && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    {validationWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">You can still submit the application despite these warnings.</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Parsed Data Preview */}
            {parsedData && (
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Parsed Information Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-islamic-primary">Student Details</h4>
                    <div className="space-y-1 mt-1">
                      <p><span className="font-medium">Name:</span> {parsedData.studentDetails?.fullName}</p>
                      <p><span className="font-medium">Mobile:</span> {parsedData.studentDetails?.mobile}</p>
                      <p><span className="font-medium">WhatsApp:</span> {parsedData.studentDetails?.whatsapp}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-islamic-primary">Hometown Details</h4>
                    <div className="space-y-1 mt-1">
                      <p><span className="font-medium">Area:</span> {parsedData.hometownDetails?.area}</p>
                      <p><span className="font-medium">City:</span> {parsedData.hometownDetails?.city}</p>
                      <p><span className="font-medium">District:</span> {parsedData.hometownDetails?.district}</p>
                      <p><span className="font-medium">State:</span> {parsedData.hometownDetails?.state}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-islamic-primary">Current Residence</h4>
                    <div className="space-y-1 mt-1">
                      <p><span className="font-medium">Area:</span> {parsedData.currentResidence?.area}</p>
                      <p><span className="font-medium">Mandal:</span> {parsedData.currentResidence?.mandal}</p>
                      <p><span className="font-medium">City:</span> {parsedData.currentResidence?.city}</p>
                      <p><span className="font-medium">State:</span> {parsedData.currentResidence?.state}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-islamic-primary">Other Details</h4>
                    <div className="space-y-1 mt-1">
                      <p><span className="font-medium">Age:</span> {parsedData.otherDetails?.age}</p>
                      <p><span className="font-medium">Qualification:</span> {parsedData.otherDetails?.qualification}</p>
                      <p><span className="font-medium">Profession:</span> {parsedData.otherDetails?.profession}</p>
                      <p><span className="font-medium">Email:</span> {parsedData.otherDetails?.email}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-islamic-primary">Referred By</h4>
                    <div className="space-y-1 mt-1">
                      <p><span className="font-medium">Name:</span> {parsedData.referredBy?.fullName}</p>
                      <p><span className="font-medium">Mobile:</span> {parsedData.referredBy?.mobile}</p>
                      <p><span className="font-medium">Student ID:</span> {parsedData.referredBy?.studentId}</p>
                      <p><span className="font-medium">Batch:</span> {parsedData.referredBy?.batch}</p>
                    </div>
                  </div>
                </div>
              </div>
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
              disabled={!parsedData || validationErrors.length > 0 || isSubmitting}
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
