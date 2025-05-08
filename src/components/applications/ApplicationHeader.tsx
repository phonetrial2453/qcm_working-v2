
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Application } from '@/types/application';
import { ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import ApplicationPDFExport from './ApplicationPDFExport';

interface ApplicationHeaderProps {
  application: Application;
  openStatusDialog?: () => void;
  isAdmin: boolean;
}

const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({ 
  application, 
  openStatusDialog, 
  isAdmin 
}) => {
  const navigate = useNavigate();

  // Copy to clipboard
  const copyToClipboard = () => {
    const statusInfo = `
Application ID: ${application.id}
Name: ${application.studentDetails?.fullName || 'Unknown'}
Mobile: ${application.studentDetails?.mobile || 'N/A'}
Status: ${application.status.toUpperCase()}
${application.remarks ? `Remarks: ${application.remarks}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(statusInfo)
      .then(() => toast.success('Status info copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Button 
        variant="ghost" 
        className="w-fit p-0 h-auto"
        onClick={() => navigate('/applications')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Status
        </Button>
        <ApplicationPDFExport application={application} />
        {isAdmin && openStatusDialog && (
          <Button 
            className="bg-islamic-primary hover:bg-islamic-primary/90"
            onClick={openStatusDialog}
          >
            Update Status
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationHeader;
