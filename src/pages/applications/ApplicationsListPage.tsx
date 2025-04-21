
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { ApplicationsHeader } from '@/components/applications/ApplicationsHeader';
import { ApplicationsFilter } from '@/components/applications/ApplicationsFilter';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import { StatusUpdateDialog } from '@/components/applications/StatusUpdateDialog';

const ApplicationsListPage: React.FC = () => {
  const { applications, classes, updateApplication, fetchApplications } = useApplications();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  const [filteredApplications, setFilteredApplications] = useState(applications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  // Get class code from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classParam = params.get('class');
    if (classParam) {
      setClassFilter(classParam);
    }
  }, [location.search]);
  
  // Filter applications
  useEffect(() => {
    let filtered = [...applications];
    
    if (!isAdmin && user?.classes) {
      filtered = filtered.filter(app => user.classes?.includes(app.classCode));
    }
    
    if (classFilter && classFilter !== 'all') {
      filtered = filtered.filter(app => app.classCode === classFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.id.toLowerCase().includes(term) ||
        (app.studentDetails?.fullName || '').toLowerCase().includes(term) ||
        (app.studentDetails?.mobile || '').includes(term) ||
        (app.otherDetails?.email || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, user, isAdmin, searchTerm, statusFilter, classFilter]);
  
  const accessibleClasses = isAdmin 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const exportToCSV = () => {
    console.log('Exporting to CSV:', filteredApplications);
    alert('CSV export feature would be implemented here');
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplicationId || !newStatus) return;
    
    setUpdatingStatus(true);
    try {
      const result = await updateApplication(selectedApplicationId, {
        status: newStatus
      });
      
      if (result) {
        toast.success('Application status updated successfully');
        await fetchApplications();
        setIsStatusDialogOpen(false);
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating the status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openStatusDialog = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsStatusDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto">
        <ApplicationsHeader 
          applicationsCount={filteredApplications.length}
          onExport={exportToCSV}
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
        
        <ApplicationsTable
          applications={filteredApplications}
          isAdmin={isAdmin}
          onChangeStatus={openStatusDialog}
          formatDate={formatDate}
        />

        <StatusUpdateDialog
          isOpen={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onUpdate={handleStatusUpdate}
          isUpdating={updatingStatus}
        />
      </div>
    </AppLayout>
  );
};

export default ApplicationsListPage;
