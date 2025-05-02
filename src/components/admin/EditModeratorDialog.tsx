
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
  };
  created_at: string;
}

interface EditModeratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  isUserAdmin: boolean;
  setIsUserAdmin: (isAdmin: boolean) => void;
  selectedClasses: string[];
  toggleClassSelection: (classCode: string) => void;
  onSave: (userId: string) => void;
  classes: { code: string; name: string }[];
}

const EditModeratorDialog: React.FC<EditModeratorDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  isUserAdmin,
  setIsUserAdmin,
  selectedClasses,
  toggleClassSelection,
  onSave,
  classes,
}) => {
  if (!editingUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user roles and class assignments.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-medium mb-2">{editingUser.raw_user_meta_data?.name || 'Unnamed User'}</h3>
          <p className="text-sm text-gray-500 mb-4">{editingUser.email}</p>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Checkbox 
                id="isAdmin" 
                checked={isUserAdmin}
                onCheckedChange={(checked) => setIsUserAdmin(checked as boolean)}
              />
              <Label htmlFor="isAdmin" className="ml-2">Admin Access</Label>
            </div>
            <p className="text-xs text-gray-500">Admins have full access to all features.</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Class Assignments</h4>
            <div className="grid grid-cols-2 gap-2">
              {classes.map(cls => (
                <div key={cls.code} className="flex items-center">
                  <Checkbox 
                    id={`class-${cls.code}`}
                    checked={selectedClasses.includes(cls.code)}
                    onCheckedChange={() => toggleClassSelection(cls.code)}
                    disabled={isUserAdmin}
                  />
                  <Label htmlFor={`class-${cls.code}`} className="ml-2">{cls.name}</Label>
                </div>
              ))}
            </div>
            {isUserAdmin && (
              <p className="text-xs text-gray-500 mt-2">Admins automatically have access to all classes.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-islamic-primary hover:bg-islamic-primary/90"
              onClick={() => onSave(editingUser.id)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditModeratorDialog;
