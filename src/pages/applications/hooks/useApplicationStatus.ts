
import { useState } from 'react';
import { useApplications } from '@/contexts/ApplicationContext';
import { toast } from 'sonner';
import { ApplicationStatus } from '@/types/application';

export const useApplicationStatus = () => {
  const { updateApplication, fetchApplications } = useApplications();
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');

  const handleStatusChange = (status: string) => {
    setNewStatus(status as ApplicationStatus);
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

  return {
    selectedApplicationId,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    updatingStatus,
    newStatus,
    handleStatusChange,
    handleStatusUpdate,
    openStatusDialog
  };
};
