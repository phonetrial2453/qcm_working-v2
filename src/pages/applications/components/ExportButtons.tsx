
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileImage, Download, FileText } from 'lucide-react';
import ApplicationPDFExport from '@/components/applications/ApplicationPDFExport';

interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportImage: () => void;
  pdfApplication?: any;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  onExportCSV,
  onExportImage,
  pdfApplication
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
      {pdfApplication && (
        <ApplicationPDFExport application={pdfApplication} />
      )}
    </div>
  );
};
