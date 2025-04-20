
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clipboard, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const applicationSchema = z.object({
  classCode: z.string().min(2, { message: "Class code is required" }),
  studentDetails: z.object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    mobile: z.string().min(10, { message: "Valid mobile number is required" }),
    whatsapp: z.string().optional(),
  }),
  otherDetails: z.object({
    email: z.string().email({ message: "Valid email is required" }),
    age: z.number().min(13, { message: "Age must be at least 13" }).optional(),
    qualification: z.string().optional(),
    profession: z.string().optional(),
  }),
  currentResidence: z.object({
    area: z.string().optional(),
    mandal: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  hometownDetails: z.object({
    area: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
  }),
  referredBy: z.object({
    fullName: z.string().optional(),
    mobile: z.string().optional(),
    studentId: z.string().optional(),
    batch: z.string().optional(),
  }),
  remarks: z.string().optional(),
});

type ValidationError = {
  field: string;
  message: string;
};

export function ApplicationFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [applicationText, setApplicationText] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const { classes, createApplication } = useApplications();
  const navigate = useNavigate();

  const parseApplicationText = (text: string) => {
    try {
      // Split the text into sections
      const sections = text.split('\n\n');
      const parsedData: any = {
        studentDetails: {},
        otherDetails: {},
        currentResidence: {},
        hometownDetails: {},
        referredBy: {},
      };

      // Get class code from the first line
      parsedData.classCode = sections[0].trim();

      sections.forEach(section => {
        const lines = section.split('\n');
        const sectionTitle = lines[0].trim().toUpperCase();

        switch(sectionTitle) {
          case 'STUDENT DETAILS':
            lines.slice(1).forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (key && value) {
                parsedData.studentDetails[key.toLowerCase().replace(/\s+/g, '')] = value;
              }
            });
            break;
          case 'OTHER DETAILS':
            lines.slice(1).forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (key && value) {
                parsedData.otherDetails[key.toLowerCase().replace(/\s+/g, '')] = 
                  key.toLowerCase().includes('age') ? parseInt(value, 10) : value;
              }
            });
            break;
          // ... similar parsing for other sections
        }
      });

      // Validate the parsed data
      const validationResult = applicationSchema.safeParse(parsedData);
      
      if (!validationResult.success) {
        const errors: ValidationError[] = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        setValidationErrors(errors);
        return null;
      }

      setValidationErrors([]);
      return parsedData;
    } catch (error) {
      toast.error('Error parsing application text. Please check the format.');
      return null;
    }
  };

  const handleSubmit = async () => {
    const parsedData = parseApplicationText(applicationText);
    if (!parsedData) {
      return;
    }

    try {
      const applicationId = await createApplication(parsedData);
      if (applicationId) {
        toast.success('Application submitted successfully!');
        setIsOpen(false);
        navigate('/applications');
      }
    } catch (error) {
      toast.error('Failed to submit application');
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
        
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handlePasteTemplate}
              className="flex items-center"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              Paste Template
            </Button>
          </div>

          <Textarea
            value={applicationText}
            onChange={(e) => setApplicationText(e.target.value)}
            placeholder="Paste your application text here..."
            className="min-h-[300px] font-mono"
          />

          {validationErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <h4 className="text-yellow-600 font-medium">Validation Warnings</h4>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-yellow-700 text-sm">
                    {error.field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-islamic-primary hover:bg-islamic-primary/90"
            >
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
}
