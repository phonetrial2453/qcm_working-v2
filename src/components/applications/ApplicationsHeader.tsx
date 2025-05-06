
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';

interface ApplicationsHeaderProps {
  applicationsCount: number;
  onExport: () => void;
}

export const ApplicationsHeader: React.FC<ApplicationsHeaderProps> = ({
  applicationsCount,
  onExport,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-islamic-primary">Applications</h1>
        <p className="text-muted-foreground">
          {applicationsCount} application{applicationsCount !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
          <Link to="/applications/new" className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
