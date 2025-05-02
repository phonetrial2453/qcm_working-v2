
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus } from 'lucide-react';

interface AddModeratorForm {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

interface AddModeratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddModerator: (data: AddModeratorForm) => void;
}

const AddModeratorDialog: React.FC<AddModeratorDialogProps> = ({ 
  open, 
  onOpenChange, 
  onAddModerator 
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddModeratorForm>();

  const handleFormSubmit = (data: AddModeratorForm) => {
    onAddModerator(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new administrator or moderator to the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="col-span-1">Name</Label>
              <Input
                id="name"
                className="col-span-3"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="col-span-1">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="col-span-1">Password</Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && <p className="text-red-500 text-xs col-span-3 col-start-2">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAdmin" className="col-span-1">Admin</Label>
              <div className="col-span-3 flex items-center">
                <Checkbox 
                  id="isAdmin" 
                  {...register('isAdmin')} 
                />
                <Label htmlFor="isAdmin" className="ml-2">Make this user an admin</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-islamic-primary hover:bg-islamic-primary/90">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModeratorDialog;
