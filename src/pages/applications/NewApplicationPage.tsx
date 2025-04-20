
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ApplicationFormDialog } from './ApplicationFormDialog';

const NewApplicationPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Applications</h1>
        <ApplicationFormDialog />
      </div>
    </AppLayout>
  );
};

export default NewApplicationPage;
