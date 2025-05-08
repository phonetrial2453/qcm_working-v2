
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Class } from '@/types/supabase-types';

interface ClassSelectorProps {
  classes: Class[];
  selectedClassCode: string;
  onClassChange: (value: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ 
  classes, 
  selectedClassCode, 
  onClassChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="class">Select Class</Label>
      <Select value={selectedClassCode} onValueChange={onClassChange}>
        <SelectTrigger id="class">
          <SelectValue placeholder="Select a class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((classItem) => (
            <SelectItem key={classItem.code} value={classItem.code}>
              {classItem.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
