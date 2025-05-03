
import React, { useState, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseApplicationText } from '@/utils/applicationValidation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ValidationResult } from '@/types/application';
import { useApplicationValidation } from "./hooks/useApplicationValidation";
import { useApplicationSubmission } from "./hooks/useApplicationSubmission";
import ApplicationPreview from "./ApplicationPreview";
import { useAuth } from '@/contexts/AuthContext';

const NewApplicationForm: React.FC = () => {
  const { classes } = useApplications();
  const { user, isAdmin } = useAuth();
  const [selectedClassCode, setSelectedClassCode] = useState<string>('');
  const [applicationText, setApplicationText] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { validationResult, validateApplication, setValidationResult } =
    useApplicationValidation(selectedClassCode, classes);
  const { handleSubmit, isSubmitting } = useApplicationSubmission();
  const navigate = useNavigate();
  
  // Filter classes based on user's access
  const accessibleClasses = isAdmin 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

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

  const handleClassChange = (value: string) => {
    setSelectedClassCode(value);
  };

  const handleSubmitWrapper = async () => {
    await handleSubmit({
      parsedData,
      selectedClassCode,
      warnings: validationResult.warnings,
    });
  };

  const handleCopyTemplate = () => {
    if (selectedTemplate) {
      navigator.clipboard
        .writeText(selectedTemplate)
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
                {accessibleClasses.map((classItem) => (
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
            <ApplicationPreview
              parsedData={parsedData}
              validationResult={validationResult}
              onSubmit={handleSubmitWrapper}
              isSubmitting={isSubmitting}
              selectedClassCode={selectedClassCode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewApplicationForm;
