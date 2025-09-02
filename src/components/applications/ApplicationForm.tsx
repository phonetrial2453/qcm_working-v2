
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
  referrerWarnings?: ValidationError[];
}

export const ApplicationForm = ({
  applicationText,
  onApplicationTextChange,
  onPasteTemplate,
  onSubmit,
  onCancel,
  validationErrors,
  referrerWarnings = [],
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
      {referrerWarnings.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-md">
          <h4 className="text-red-800 font-medium mb-2">Referrer Details Warning</h4>
          <ul className="space-y-1">
            {referrerWarnings.map((warning, index) => (
              <li key={index} className="text-red-700 text-sm">
                • {warning.message}
              </li>
            ))}
          </ul>
          <p className="text-red-600 text-xs mt-2">
            You can still submit, but providing complete referrer details is recommended.
          </p>
        </div>
      )}

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
