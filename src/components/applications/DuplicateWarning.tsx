import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { DuplicateMatch } from '@/utils/multiApplicationParser';

interface DuplicateWarningProps {
  duplicates: DuplicateMatch[];
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({ duplicates }) => {
  if (duplicates.length === 0) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        <strong>Potential duplicate entries found:</strong>
        <div className="mt-2 space-y-1">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="text-xs bg-amber-100 p-2 rounded">
              <strong>ID:</strong> {duplicate.id} | 
              <strong> Name:</strong> {duplicate.name} | 
              <strong> Mobile:</strong> {duplicate.mobile}
            </div>
          ))}
        </div>
        <p className="text-xs mt-2">
          Please verify these are not duplicate entries before submitting.
        </p>
      </AlertDescription>
    </Alert>
  );
};