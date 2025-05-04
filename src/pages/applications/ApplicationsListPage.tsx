
import React, { useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ApplicationsHeader } from '@/components/applications/ApplicationsHeader';
import { ApplicationsFilter } from '@/components/applications/ApplicationsFilter';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import { StatusUpdateDialog } from '@/components/applications/StatusUpdateDialog';
import { ExportButtons } from './components/ExportButtons';
import { useApplicationsList } from './hooks/useApplicationsList';
import { useApplicationStatus } from './hooks/useApplicationStatus';
import { exportToCSV, exportToImage, formatDate } from './utils/exportUtils';

const ApplicationsListPage: React.FC = () => {
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

  return (
    <AppLayout>
      <div className="container mx-auto">
        <ApplicationsHeader 
          applicationsCount={filteredApplications.length}
          onExport={handleExportCSV}
        />
        
        <ExportButtons 
          onExportCSV={handleExportCSV}
          onExportImage={handleExportImage}
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
