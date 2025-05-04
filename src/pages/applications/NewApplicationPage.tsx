
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import NewApplicationForm from '@/components/applications/NewApplicationForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NewApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout requireAuth={true} moderatorOrAdmin={true}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="p-0 h-auto"
            onClick={() => navigate('/applications')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          
          <h1 className="text-2xl font-bold">New Application</h1>
        </div>
        <NewApplicationForm />
      </div>
    </AppLayout>
  );
};

export default NewApplicationPage;
