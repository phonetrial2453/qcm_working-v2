
import { AlertTriangle } from 'lucide-react';
import { ValidationError } from '@/utils/applicationValidation';

interface ValidationWarningsProps {
  errors: ValidationError[];
}

export const ValidationWarnings = ({ errors }: ValidationWarningsProps) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex items-center mb-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
        <h4 className="text-yellow-600 font-medium">Validation Warnings</h4>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-yellow-700 text-sm">
            {error.field}: {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
