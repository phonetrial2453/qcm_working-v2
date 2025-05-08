
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ApplicationStatus } from '@/types/application';

export const useApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { applications, updateApplication, fetchApplications } = useApplications();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  // Find the application by id
  const application = id ? applications.find(app => app.id === id) : undefined;
  
  useEffect(() => {
    // Fetch applications data when component mounts
    const loadData = async () => {
      try {
        await fetchApplications();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchApplications]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle status update
  const handleStatusUpdate = async (status: ApplicationStatus, remarks: string) => {
    if (!application) return;
    
    try {
      const result = await updateApplication(application.id, {
        status: status,
        remarks: remarks,
        updatedAt: new Date().toISOString(),
      });
      
      if (result) {
        setOpenDialog(false);
        toast.success(`Application status updated to ${status}`);
      }
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error("Failed to update application status");
    }
  };

  return {
    application,
    loading,
    isAdmin,
    formatDate,
    openDialog,
    setOpenDialog,
    handleStatusUpdate
  };
};
