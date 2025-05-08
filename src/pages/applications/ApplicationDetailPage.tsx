
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ApplicationHeader from '@/components/applications/ApplicationHeader';
import ApplicationDetails from '@/components/applications/ApplicationDetails';
import UpdateStatusDialog from '@/components/applications/UpdateStatusDialog';
import { useApplicationDetail } from '@/components/applications/hooks/useApplicationDetail';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ApplicationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    application,
    loading,
    isAdmin,
    formatDate,
    openDialog,
    setOpenDialog,
    handleStatusUpdate
  } = useApplicationDetail();
  
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto bg-muted rounded-full mb-4"></div>
            <div className="h-6 w-48 mx-auto bg-muted rounded mb-2"></div>
            <div className="h-4 w-64 mx-auto bg-muted rounded mb-6"></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!application) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Application Not Found</h1>
          <p className="text-muted-foreground mb-6">The application could not be found.</p>
          <Button onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <ApplicationHeader 
          application={application} 
          isAdmin={isAdmin}
          openStatusDialog={() => setOpenDialog(true)}
        />
        
        <ApplicationDetails 
          application={application} 
          formatDate={formatDate} 
        />
        
        {isAdmin && (
          <UpdateStatusDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            initialStatus={application.status as any}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ApplicationDetailPage;
