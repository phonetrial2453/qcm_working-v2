
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { useNavigate } from 'react-router-dom';
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { applicationSchema, parseApplicationText, ValidationError } from '@/utils/applicationValidation';

export function ApplicationFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { classes, createApplication } = useApplications();
  const navigate = useNavigate();

  const validateApplication = (parsedData: any) => {
    const validationResult = applicationSchema.safeParse(parsedData);
    if (!validationResult.success) {
      const errors: ValidationError[] = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleSubmit = async () => {
    const parsedData = parseApplicationText(applicationText);
    if (!parsedData || !validateApplication(parsedData)) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    try {
      const applicationId = await createApplication(parsedData);
      if (applicationId) {
        toast.success('Application submitted successfully!');
        setIsOpen(false);
        setApplicationText('');
        navigate('/applications');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const handlePasteTemplate = () => {
    const selectedClass = classes.find(c => c.code === applicationText.split('\n')[0]?.trim());
    if (selectedClass?.template) {
      setApplicationText(selectedClass.template);
    } else {
      toast.error('No template found for this class code');
    }
  };

  const handleTextChange = (newText: string) => {
    setApplicationText(newText);
    const parsedData = parseApplicationText(newText);
    if (parsedData) {
      validateApplication(parsedData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Application</DialogTitle>
        </DialogHeader>
        <ApplicationForm
          applicationText={applicationText}
          onApplicationTextChange={handleTextChange}
          onPasteTemplate={handlePasteTemplate}
          onSubmit={handleSubmit}
          onCancel={() => setIsOpen(false)}
          validationErrors={validationErrors}
        />
      </DialogContent>
    </Dialog>
  );
}
