
import React from 'react';
import { Loader2 } from 'lucide-react';

const ClassFormLoader: React.FC = () => {
  return (
    <div className="container mx-auto max-w-2xl flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ClassFormLoader;
