
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import ValidationWarnings from './ValidationWarnings';
import { ValidationError } from '@/utils/applicationValidation';

interface ApplicationFormProps {
  applicationText: string;
  onApplicationTextChange: (text: string) => void;
  onPasteTemplate: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  validationErrors: ValidationError[];
}

export const ApplicationForm = ({
  applicationText,
  onApplicationTextChange,
  onPasteTemplate,
  onSubmit,
  onCancel,
  validationErrors,
}: ApplicationFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onPasteTemplate}
          className="flex items-center"
        >
          <Clipboard className="w-4 h-4 mr-2" />
          Paste Template
        </Button>
      </div>

      <Textarea
        value={applicationText}
        onChange={(e) => onApplicationTextChange(e.target.value)}
        placeholder="Paste your application text here..."
        className="min-h-[300px] font-mono"
      />

      <ValidationWarnings warnings={validationErrors} />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          className="bg-islamic-primary hover:bg-islamic-primary/90"
          disabled={validationErrors.length > 0}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
};
