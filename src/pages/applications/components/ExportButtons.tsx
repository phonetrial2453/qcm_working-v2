
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileImage, Download } from 'lucide-react';

interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportImage: () => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  onExportCSV,
  onExportImage 
}) => {
  return (
    <div className="flex justify-end mb-4 gap-2">
      <Button variant="outline" onClick={onExportCSV}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={onExportImage}>
        <FileImage className="h-4 w-4 mr-2" />
        Export as Image
      </Button>
    </div>
  );
};
