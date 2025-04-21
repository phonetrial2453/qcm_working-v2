
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newStatus: string;
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status of the selected application
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onUpdate} 
              disabled={!newStatus || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
