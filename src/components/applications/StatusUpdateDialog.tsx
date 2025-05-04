
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApplicationStatus } from '@/types/application';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newStatus: ApplicationStatus;
  onStatusChange: (status: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  isOpen,
  onOpenChange,
  newStatus,
  onStatusChange,
  onUpdate,
  isUpdating,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Application Status</AlertDialogTitle>
          <AlertDialogDescription>
            Change the status of the selected application
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <Select value={newStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onUpdate} 
            disabled={!newStatus || isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
