import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from 'sonner';
import { ApplicationsHeader } from '@/components/applications/ApplicationsHeader';
import { ApplicationsFilter } from '@/components/applications/ApplicationsFilter';
import { ApplicationsTable } from '@/components/applications/ApplicationsTable';
import { StatusUpdateDialog } from '@/components/applications/StatusUpdateDialog';
import { FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Application, ApplicationStatus } from '@/types/application';

const ApplicationsListPage: React.FC = () => {
  const { applications, classes, updateApplication, fetchApplications } = useApplications();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(applications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');

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
    
    // Important: First filter by user's assigned classes
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
    const headers = [
      'ID', 'Name', 'Email', 'Mobile', 'Class', 'Status', 'Date'
    ];
    
    const rows = filteredApplications.map(app => [
      app.id,
      app.studentDetails?.fullName || '',
      app.otherDetails?.email || '',
      app.studentDetails?.mobile || '',
      app.classCode,
      app.status,
      formatDate(app.createdAt) // Fixed: using camelCase property name
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `applications-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV report exported successfully');
  };

  const exportToImage = () => {
    if (!tableRef.current) {
      toast.error('Table not found for export');
      return;
    }
    
    try {
      // Use html2canvas to capture the table
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(tableRef.current!).then(canvas => {
          // Convert to downloadable image
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `applications-${new Date().toISOString().slice(0, 10)}.png`;
          link.href = imgData;
          link.click();
          toast.success('Applications report exported as image');
        });
      }).catch(err => {
        console.error('Error loading html2canvas:', err);
        toast.error('Failed to export report as image');
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
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

  // Fix the type of the onChangeStatus function to accept ApplicationStatus
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
        
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={exportToImage} className="ml-2">
            <FileImage className="h-4 w-4 mr-2" />
            Export as Image
          </Button>
        </div>
        
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
          onStatusChange={setNewStatus}
          onUpdate={handleStatusUpdate}
          isUpdating={updatingStatus}
        />
      </div>
    </AppLayout>
  );
};

export default ApplicationsListPage;
