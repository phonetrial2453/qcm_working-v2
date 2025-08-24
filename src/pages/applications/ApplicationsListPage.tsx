
import React, { useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ApplicationsFilter } from '@/components/applications/ApplicationsFilter';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import { StatusUpdateDialog } from '@/components/applications/StatusUpdateDialog';
import { ApplicationsHeader } from '@/components/applications/ApplicationsHeader';
import { useApplicationsList } from './hooks/useApplicationsList';
import { useApplicationStatus } from './hooks/useApplicationStatus';
import { exportToCSV, exportToImage, formatDate } from './utils/exportUtils';
import { useApplications } from '@/contexts/ApplicationContext';
import { toast } from '@/components/ui/sonner';

const ApplicationsListPage: React.FC = () => {
  const { deleteApplication, fetchApplications } = useApplications();
  const {
    filteredApplications,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    classFilter,
    setClassFilter,
    accessibleClasses,
    isAdmin
  } = useApplicationsList();

  const {
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    updatingStatus,
    newStatus,
    handleStatusChange,
    handleStatusUpdate,
    openStatusDialog
  } = useApplicationStatus();
  
  const tableRef = useRef<HTMLDivElement>(null);

  const handleExportCSV = () => {
    exportToCSV(filteredApplications);
  };

  const handleExportImage = () => {
    exportToImage(tableRef);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete applications');
      return;
    }

    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await deleteApplication(applicationId);
        toast.success('Application deleted successfully');
        await fetchApplications(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting application:', error);
        toast.error(`Failed to delete application: ${error.message}`);
      }
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto">
        <ApplicationsHeader 
          applicationsCount={filteredApplications.length}
          onExport={handleExportCSV}
        />
        
        <ApplicationsFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          classFilter={classFilter}
          setClassFilter={setClassFilter}
          accessibleClasses={accessibleClasses}
        />
        
        <div ref={tableRef}>
          <ApplicationsTable
            applications={filteredApplications}
            isAdmin={isAdmin}
            onChangeStatus={openStatusDialog}
            onDeleteApplication={handleDeleteApplication}
            formatDate={formatDate}
          />
        </div>

        <StatusUpdateDialog
          isOpen={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          newStatus={newStatus}
          onStatusChange={handleStatusChange}
          onUpdate={handleStatusUpdate}
          isUpdating={updatingStatus}
        />
      </div>
    </AppLayout>
  );
};

export default ApplicationsListPage;
