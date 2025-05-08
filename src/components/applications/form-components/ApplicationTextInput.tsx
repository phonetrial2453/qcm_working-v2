
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApplicationTextInputProps {
  applicationText: string;
  onTextChange: (text: string) => void;
  onCopyTemplate: () => void;
  onPaste: () => void;
  hasTemplate: boolean;
}

export const ApplicationTextInput: React.FC<ApplicationTextInputProps> = ({
  applicationText,
  onTextChange,
  onCopyTemplate,
  onPaste,
  hasTemplate,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="applicationText">Paste Application Text</Label>
        <div className="space-x-2">
          {hasTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyTemplate}
            >
              Copy Template
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onPaste}
          >
            Paste from Clipboard
          </Button>
        </div>
      </div>
      <Textarea
        id="applicationText"
        placeholder="Paste the application text here..."
        value={applicationText}
        onChange={(e) => onTextChange(e.target.value)}
        rows={15}
        className="font-mono text-sm"
      />
    </div>
  );
};
