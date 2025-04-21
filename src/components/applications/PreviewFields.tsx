
import React from 'react';
import { Label } from '@/components/ui/label';

interface PreviewSectionProps {
  title: string;
  data: Record<string, any>;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ title, data }) => {
  if (!data || Object.keys(data).length === 0) return null;
  
  return (
    <div className="space-y-2 mb-4">
      <h3 className="font-medium text-sm uppercase text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs capitalize text-muted-foreground">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
            <div className="bg-slate-50 p-2 rounded border text-sm">
              {value ? String(value) : <span className="text-slate-400">Not provided</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PreviewFieldsProps {
  data: {
    studentDetails?: Record<string, any>;
    otherDetails?: Record<string, any>;
    hometownDetails?: Record<string, any>;
    currentResidence?: Record<string, any>;
    referredBy?: Record<string, any>;
    [key: string]: any;
  };
}

const PreviewFields: React.FC<PreviewFieldsProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <PreviewSection title="Student Details" data={data.studentDetails || {}} />
      <PreviewSection title="Other Details" data={data.otherDetails || {}} />
      <PreviewSection title="Hometown Details" data={data.hometownDetails || {}} />
      <PreviewSection title="Current Residence" data={data.currentResidence || {}} />
      <PreviewSection title="Referred By" data={data.referredBy || {}} />
    </div>
  );
};

export default PreviewFields;
