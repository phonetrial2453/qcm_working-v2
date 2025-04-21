import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Warning {
  field: string;
  message: string;
}

interface ValidationWarningsProps {
  warnings: Warning[];
}

const ValidationWarnings: React.FC<ValidationWarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="px-4 py-3 rounded-lg bg-green-50 text-green-700 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Validation passed! All fields are valid.</span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-amber-50 border border-amber-200">
      <div className="px-4 py-3 bg-amber-100 rounded-t-lg flex items-center space-x-2 text-amber-800 font-medium">
        <AlertTriangle className="h-5 w-5" />
        <span>Validation Warnings ({warnings.length})</span>
      </div>
      <ul className="p-4 space-y-2">
        {warnings.map((warning, index) => (
          <li key={index} className="text-amber-700 flex items-start space-x-2">
            <span className="font-medium">{warning.field}:</span>
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationWarnings;
