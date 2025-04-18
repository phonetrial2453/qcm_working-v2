
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
import { AlertCircle, Check, X, List, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ParsedApplication extends Partial<StudentApplication> {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const NewApplicationPage: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [multipleApplications, setMultipleApplications] = useState<string[]>([]);
  const [parsedApplications, setParsedApplications] = useState<ParsedApplication[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [expandedApplicationIndex, setExpandedApplicationIndex] = useState<number | null>(null);
  
  const { user } = useAuth();
  const { validateApplication, addApplication, classes } = useApplications();
  const navigate = useNavigate();

  const accessibleClasses = user?.role === 'admin' 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

  const parseApplications = () => {
    if (!selectedClass) {
      toast.error('Please select a class before parsing the application');
      return;
    }

    if (activeTab === 'single') {
      if (!rawText.trim()) {
        toast.error('Please enter application text');
        return;
      }
      
      try {
        const parsedApplication = parseAndValidateApplication(rawText, selectedClass);
        setParsedApplications([parsedApplication]);
      } catch (error) {
        console.error('Parsing error:', error);
        toast.error('Failed to parse application. Please check the format.');
      }
    } else {
      if (multipleApplications.length === 0) {
        toast.error('Please enter at least one application');
        return;
      }
      
      try {
        const parsedApps = multipleApplications.map(appText => 
          parseAndValidateApplication(appText, selectedClass)
        );
        setParsedApplications(parsedApps);
        
        const validApps = parsedApps.filter(app => app.valid).length;
        toast.success(`Successfully parsed ${validApps} of ${parsedApps.length} applications`);
      } catch (error) {
        console.error('Parsing error:', error);
        toast.error('Failed to parse applications. Please check the format.');
      }
    }
  };

  const parseAndValidateApplication = (text: string, classCode: string): ParsedApplication => {
    const parsedApplication = parseApplicationText(text, classCode);
    
    const validationResult = validateApplication(parsedApplication);
    
    const warnings: string[] = [];
    
    const age = parsedApplication.otherDetails?.age;
    if (age && (age < 25 || age > 45)) {
      warnings.push(`Age (${age}) is outside the recommended range of 25-45 years`);
    }
    
    const qualification = parsedApplication.otherDetails?.qualification || '';
    const graduateKeywords = ['graduate', 'b.', 'bachelor', 'm.', 'master', 'ph.d', 'doctorate'];
    if (!graduateKeywords.some(keyword => qualification.toLowerCase().includes(keyword))) {
      warnings.push('Qualification may not be graduate-level or above');
    }
    
    return {
      ...parsedApplication,
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings
    };
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

  const splitMultipleApplications = (text: string) => {
    // Use the "=====================" as separator
    const applicationTexts = text.split(/={20,}/).filter(app => app.trim().length > 0);
    setMultipleApplications(applicationTexts);
    toast.success(`Found ${applicationTexts.length} applications`);
  };

  const handleSubmit = async () => {
    if (parsedApplications.length === 0) {
      toast.error('Please parse applications before submitting');
      return;
    }

    const validApplications = parsedApplications.filter(app => app.valid);
    if (validApplications.length === 0) {
      toast.error('No valid applications to submit');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const app of validApplications) {
        try {
          // Remove the validation fields we added
          const { valid, errors, warnings, ...cleanApp } = app;
          
          await addApplication(cleanApp as Omit<StudentApplication, 'id' | 'createdAt' | 'updatedAt'>);
          successCount++;
        } catch (error) {
          console.error('Error submitting application:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully submitted ${successCount} application(s)`);
        if (successCount === 1) {
          navigate('/applications');
        } else {
          navigate('/applications');
        }
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to submit ${errorCount} application(s)`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (appIndex: number, field: string, subField: string, value: string | number) => {
    setParsedApplications(prev => {
      const updated = [...prev];
      
      if (!updated[appIndex]) return prev;
      
      switch (field) {
        case 'studentDetails':
          updated[appIndex].studentDetails = {
            ...updated[appIndex].studentDetails!,
            [subField]: value
          };
          break;
        case 'hometownDetails':
          updated[appIndex].hometownDetails = {
            ...updated[appIndex].hometownDetails!,
            [subField]: value
          };
          break;
        case 'currentResidence':
          updated[appIndex].currentResidence = {
            ...updated[appIndex].currentResidence!,
            [subField]: value
          };
          break;
        case 'otherDetails':
          updated[appIndex].otherDetails = {
            ...updated[appIndex].otherDetails!,
            [subField]: value
          };
          break;
        case 'referredBy':
          updated[appIndex].referredBy = {
            ...updated[appIndex].referredBy!,
            [subField]: value
          };
          break;
      }
      
      return updated;
    });
  };

  const toggleExpandApplication = (index: number) => {
    setExpandedApplicationIndex(expandedApplicationIndex === index ? null : index);
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-islamic-primary">New Application</h1>
          <p className="text-muted-foreground">Submit applications for Quran Classes</p>
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

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Application</TabsTrigger>
                <TabsTrigger value="multiple">Multiple Applications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single">
                <div className="space-y-2 mt-4">
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
              </TabsContent>
              
              <TabsContent value="multiple">
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="multiple-applications">Multiple Applications</Label>
                    <Textarea
                      id="multiple-applications"
                      placeholder="Paste multiple applications here..."
                      rows={15}
                      onChange={(e) => splitMultipleApplications(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste multiple applications separated by =====================
                    </p>
                  </div>
                  
                  {multipleApplications.length > 0 && (
                    <div className="border rounded-md p-4 bg-muted/30">
                      <h3 className="font-semibold mb-3">Applications Found: {multipleApplications.length}</h3>
                      <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                        {multipleApplications.map((app, i) => (
                          <div key={i} className="p-2 text-sm hover:bg-muted/50">
                            Application #{i+1}: {app.split('\n').find(line => line.includes('Full Name'))?.split(':')[1]?.trim() || 'Unknown'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              type="button" 
              onClick={parseApplications}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              Parse Application{activeTab === 'multiple' ? 's' : ''}
            </Button>

            {parsedApplications.length > 0 && (
              <>
                <div className="border rounded-md p-4 bg-muted/10">
                  <h3 className="font-semibold mb-3">Applications Summary</h3>
                  <div className="flex gap-2 mb-4">
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      Valid: {parsedApplications.filter(app => app.valid).length}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm">
                      Invalid: {parsedApplications.filter(app => !app.valid).length}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">
                      Warnings: {parsedApplications.filter(app => app.warnings.length > 0).length}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {parsedApplications.map((app, index) => (
                      <Card key={index} className={`border ${app.valid ? 'border-green-200' : 'border-red-200'}`}>
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{app.studentDetails?.fullName || `Application #${index + 1}`}</CardTitle>
                            <CardDescription className="text-xs">
                              {app.valid ? 
                                <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Valid</span> : 
                                <span className="text-red-600 flex items-center gap-1"><X className="h-3 w-3" /> Invalid</span>
                              }
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleExpandApplication(index)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedApplicationIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CardHeader>
                        
                        {expandedApplicationIndex === index && (
                          <>
                            {app.errors.length > 0 && (
                              <div className="px-4 py-2">
                                <Alert variant="destructive" className="mb-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Validation Errors</AlertTitle>
                                  <AlertDescription>
                                    <ul className="list-disc pl-5 mt-2 text-xs">
                                      {app.errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                      ))}
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}
                            
                            {app.warnings.length > 0 && (
                              <div className="px-4 py-2">
                                <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                  <AlertTitle>Warnings</AlertTitle>
                                  <AlertDescription>
                                    <ul className="list-disc pl-5 mt-2 text-xs">
                                      {app.warnings.map((warning, i) => (
                                        <li key={i}>{warning}</li>
                                      ))}
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}
                            
                            <CardContent className="px-4 py-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-islamic-primary">Student Details</h4>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`student-name-${index}`} className="text-xs">Full Name</Label>
                                      <Input 
                                        id={`student-name-${index}`}
                                        value={app.studentDetails?.fullName || ''}
                                        onChange={(e) => handleInputChange(index, 'studentDetails', 'fullName', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`student-mobile-${index}`} className="text-xs">Mobile</Label>
                                      <Input 
                                        id={`student-mobile-${index}`}
                                        value={app.studentDetails?.mobile || ''}
                                        onChange={(e) => handleInputChange(index, 'studentDetails', 'mobile', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`student-whatsapp-${index}`} className="text-xs">WhatsApp</Label>
                                      <Input 
                                        id={`student-whatsapp-${index}`}
                                        value={app.studentDetails?.whatsapp || ''}
                                        onChange={(e) => handleInputChange(index, 'studentDetails', 'whatsapp', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-islamic-primary">Hometown Details</h4>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`hometown-area-${index}`} className="text-xs">Area</Label>
                                      <Input 
                                        id={`hometown-area-${index}`}
                                        value={app.hometownDetails?.area || ''}
                                        onChange={(e) => handleInputChange(index, 'hometownDetails', 'area', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`hometown-city-${index}`} className="text-xs">City</Label>
                                      <Input 
                                        id={`hometown-city-${index}`}
                                        value={app.hometownDetails?.city || ''}
                                        onChange={(e) => handleInputChange(index, 'hometownDetails', 'city', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`hometown-state-${index}`} className="text-xs">State</Label>
                                      <Input 
                                        id={`hometown-state-${index}`}
                                        value={app.hometownDetails?.state || ''}
                                        onChange={(e) => handleInputChange(index, 'hometownDetails', 'state', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-islamic-primary">Current Residence</h4>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`residence-area-${index}`} className="text-xs">Area</Label>
                                      <Input 
                                        id={`residence-area-${index}`}
                                        value={app.currentResidence?.area || ''}
                                        onChange={(e) => handleInputChange(index, 'currentResidence', 'area', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`residence-city-${index}`} className="text-xs">City</Label>
                                      <Input 
                                        id={`residence-city-${index}`}
                                        value={app.currentResidence?.city || ''}
                                        onChange={(e) => handleInputChange(index, 'currentResidence', 'city', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`residence-state-${index}`} className="text-xs">State</Label>
                                      <Input 
                                        id={`residence-state-${index}`}
                                        value={app.currentResidence?.state || ''}
                                        onChange={(e) => handleInputChange(index, 'currentResidence', 'state', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-medium text-sm text-islamic-primary">Other Details</h4>
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`other-age-${index}`} className="text-xs">Age</Label>
                                      <Input 
                                        id={`other-age-${index}`}
                                        type="number"
                                        value={app.otherDetails?.age || ''}
                                        onChange={(e) => handleInputChange(index, 'otherDetails', 'age', parseInt(e.target.value) || 0)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`other-qualification-${index}`} className="text-xs">Qualification</Label>
                                      <Input 
                                        id={`other-qualification-${index}`}
                                        value={app.otherDetails?.qualification || ''}
                                        onChange={(e) => handleInputChange(index, 'otherDetails', 'qualification', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                      <Label htmlFor={`other-email-${index}`} className="text-xs">Email</Label>
                                      <Input 
                                        id={`other-email-${index}`}
                                        value={app.otherDetails?.email || ''}
                                        onChange={(e) => handleInputChange(index, 'otherDetails', 'email', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
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
              disabled={parsedApplications.filter(app => app.valid).length === 0 || isSubmitting}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              {isSubmitting ? 'Submitting...' : `Submit ${parsedApplications.filter(app => app.valid).length} Application(s)`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NewApplicationPage;
