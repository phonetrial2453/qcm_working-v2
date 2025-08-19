
import React, { useState, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { toast } from 'sonner';
import { parseApplicationText } from '@/utils/applicationValidation';
import { useApplicationValidation } from "./hooks/useApplicationValidation";
import { useApplicationSubmission } from "./hooks/useApplicationSubmission";
import ApplicationPreview from "./ApplicationPreview";
import { useAuth } from '@/contexts/AuthContext';
import { FormCard } from './form-components/FormCard';
import { ClassSelector } from './form-components/ClassSelector';
import { ApplicationTextInput } from './form-components/ApplicationTextInput';
import { MultiApplicationForm } from './MultiApplicationForm';

// Form data key for localStorage
const FORM_DATA_KEY = 'application_form_data';

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
  
  // Filter classes based on user's access
  const accessibleClasses = isAdmin 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem(FORM_DATA_KEY);
      if (savedFormData) {
        const { classCode, text } = JSON.parse(savedFormData);
        if (classCode) setSelectedClassCode(classCode);
        if (text) setApplicationText(text);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedClassCode || applicationText) {
        localStorage.setItem(
          FORM_DATA_KEY,
          JSON.stringify({
            classCode: selectedClassCode,
            text: applicationText
          })
        );
      }
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [selectedClassCode, applicationText]);

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
  }, [applicationText, validateApplication]);

  const handleClassChange = (value: string) => {
    setSelectedClassCode(value);
  };

  const handleSubmitWrapper = async () => {
    console.log("Submit button clicked");
    
    if (!selectedClassCode) {
      toast.error('Please select a class');
      return;
    }

    if (!parsedData) {
      toast.error('Invalid application data');
      return;
    }
    
    console.log("Proceeding with submission...");
    console.log("Selected class code:", selectedClassCode);
    console.log("Current user:", user);
    console.log("Validation warnings:", validationResult.warnings);

    const result = await handleSubmit({
      parsedData,
      selectedClassCode,
      warnings: validationResult.warnings,
    });
    
    console.log("Submission completed with result:", result);
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
      <FormCard 
        title="New Application" 
        description="Create a new application by pasting formatted text data"
      >
        <div className="space-y-4">
          <ClassSelector 
            classes={accessibleClasses}
            selectedClassCode={selectedClassCode}
            onClassChange={handleClassChange}
          />
          
          <ApplicationTextInput 
            applicationText={applicationText}
            onTextChange={setApplicationText}
            onCopyTemplate={handleCopyTemplate}
            onPaste={handlePaste}
            hasTemplate={!!selectedTemplate}
          />
        </div>
      </FormCard>
      
      {applicationText.trim() && (
        <FormCard 
          title="Preview" 
          description="Review the parsed application data before submission"
        >
          <MultiApplicationForm
            applicationText={applicationText}
            selectedClassCode={selectedClassCode}
          />
        </FormCard>
      )}
    </div>
  );
};

export default NewApplicationForm;
