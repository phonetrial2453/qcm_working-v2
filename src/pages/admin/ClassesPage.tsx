
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const ClassesPage = () => {
  const navigate = useNavigate();
  const { classes, refreshClasses } = useApplications();

  useEffect(() => {
    refreshClasses();
  }, []);

  const handleEdit = (classCode: string) => {
    navigate(`/admin/classes/edit/${classCode}`);
  };

  const handleAddNew = () => {
    navigate('/admin/classes/new');
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Class Management</h1>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Class
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.code}>
                  <TableCell className="font-medium">{cls.code}</TableCell>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>{cls.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(cls.code)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClassesPage;
