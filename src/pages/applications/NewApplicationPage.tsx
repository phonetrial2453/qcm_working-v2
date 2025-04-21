
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import NewApplicationForm from '@/components/applications/NewApplicationForm';

const NewApplicationPage: React.FC = () => {
  return (
    <AppLayout requireAuth={true} moderatorOrAdmin={true}>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">New Application</h1>
        <NewApplicationForm />
      </div>
    </AppLayout>
  );
};

export default NewApplicationPage;
