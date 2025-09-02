import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clipboard, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { parseMultipleApplications, validateReferrerDetails, DuplicateMatch } from '@/utils/multiApplicationParser';
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck';
import { useApplications } from '@/contexts/ApplicationContext';
import { toast } from 'sonner';

interface MultiApplicationFormProps {
  onClose: () => void;
}

export const MultiApplicationForm: React.FC<MultiApplicationFormProps> = ({ onClose }) => {
  const [applicationText, setApplicationText] = useState('');
  const [parsedApplications, setParsedApplications] = useState<any[]>([]);
  const [referrerWarnings, setReferrerWarnings] = useState<any[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { checkForDuplicates } = useDuplicateCheck();
  const { createApplication } = useApplications();

  const handleParseApplications = async () => {
    if (!applicationText.trim()) {
      toast.error('Please enter application text');
      return;
    }

    setIsProcessing(true);
    try {
      const results = await parseMultipleApplications(applicationText, checkForDuplicates);
      
      if (results.length === 0) {
        toast.error('No valid applications found in the text');
        return;
      }

      const applications = results.map(result => result.data);
      const duplicates = results.map(result => result.duplicates);
      const referrerWarnings = applications.map(app => validateReferrerDetails(app));

      setParsedApplications(applications);
      setDuplicateWarnings(duplicates);
      setReferrerWarnings(referrerWarnings);
      
      toast.success(`Parsed ${applications.length} applications successfully`);
    } catch (error) {
      console.error('Error parsing applications:', error);
      toast.error('Failed to parse applications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitAll = async () => {
    if (parsedApplications.length === 0) {
      toast.error('No applications to submit');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const application of parsedApplications) {
      try {
        const result = await createApplication(application);
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        errorCount++;
      }
    }

    toast.success(`Successfully submitted ${successCount} applications${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    setIsSubmitting(false);
    onClose();
  };

  const handlePasteTemplate = () => {
    const template = `=== Full Name: [Student Name]

STUDENT DETAILS
================
Full Name: [Student Full Name]
Mobile: [Student Mobile Number]
WhatsApp: [WhatsApp Number (optional)]

OTHER DETAILS
================
Email: [Email Address]
Age: [Age]
Qualification: [Educational Qualification]
Profession: [Current Profession]

HOMETOWN DETAILS
================
Area: [Hometown Area]
City: [Hometown City]
District: [Hometown District]
State: [Hometown State]

CURRENT RESIDENCE
================
Area: [Current Area]
Mandal: [Current Mandal]
City: [Current City]
State: [Current State]

REFERRED BY
================
Full Name: [Referrer Full Name]
Mobile: [Referrer Mobile]
Student ID: [Referrer Student ID]
Batch: [Referrer Batch]

=== Full Name: [Next Student Name]
[Continue with next student details...]`;

    setApplicationText(template);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Multiple Application Parser</h2>
        <Button variant="outline" onClick={handlePasteTemplate}>
          <Clipboard className="w-4 h-4 mr-2" />
          Paste Template
        </Button>
      </div>

      <Textarea
        value={applicationText}
        onChange={(e) => setApplicationText(e.target.value)}
        placeholder="Paste multiple application texts here... Use '=== Full Name:' to separate each application."
        className="min-h-[300px] font-mono"
      />

      <div className="flex gap-2">
        <Button 
          onClick={handleParseApplications}
          disabled={isProcessing || !applicationText.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? 'Processing...' : 'Parse Applications'}
        </Button>
        
        {parsedApplications.length > 0 && (
          <Button 
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="bg-islamic-primary hover:bg-islamic-primary/90"
          >
            {isSubmitting ? 'Submitting...' : `Submit All (${parsedApplications.length})`}
          </Button>
        )}
      </div>

      {/* Parsed Applications Preview */}
      {parsedApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Parsed Applications ({parsedApplications.length})</h3>
          
          {parsedApplications.map((app, index) => (
            <Card key={index} className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {app.studentDetails?.fullName || `Application ${index + 1}`}
                  {duplicateWarnings[index]?.length > 0 && (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><strong>Mobile:</strong> {app.studentDetails?.mobile || 'N/A'}</div>
                  <div><strong>Email:</strong> {app.otherDetails?.email || 'N/A'}</div>
                  <div><strong>Class:</strong> {app.classCode || 'N/A'}</div>
                  <div><strong>Referrer:</strong> {app.referredBy?.fullName || 'N/A'}</div>
                </div>

                {/* Referrer Warnings */}
                {referrerWarnings[index]?.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>Missing Referrer Details:</strong>
                      <ul className="mt-1 text-xs">
                        {referrerWarnings[index].map((warning: any, wIndex: number) => (
                          <li key={wIndex}>• {warning.message}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Duplicate Warnings */}
                {duplicateWarnings[index]?.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      <strong>Potential Duplicates Found:</strong>
                      <ul className="mt-1 text-xs">
                        {duplicateWarnings[index].map((duplicate: DuplicateMatch, dIndex: number) => (
                          <li key={dIndex}>
                            • ID: {duplicate.id}, Name: {duplicate.name}, Mobile: {duplicate.mobile}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};