
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  validationRules: {
    ageRange?: { min?: number; max?: number };
    allowedStates?: string[];
    minimumQualification?: string;
  };
  template: string | null;
  created_at: string;
  updated_at: string;
}

const PublicClassesList: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('classes').select('*');
      
        if (error) {
          throw error;
        }
      
        if (data) {
          // Transform data to match ClassInfo type
          const transformedClasses = data.map(cls => ({
            id: cls.id,
            code: cls.code,
            name: cls.name,
            description: cls.description || '',
            validationRules: typeof cls.validation_rules === 'object' 
              ? cls.validation_rules as { 
                  ageRange?: { min?: number; max?: number }; 
                  allowedStates?: string[]; 
                  minimumQualification?: string; 
                } 
              : { 
                  ageRange: undefined, 
                  allowedStates: undefined, 
                  minimumQualification: undefined 
                },
            template: cls.template || '',
            created_at: cls.created_at,
            updated_at: cls.updated_at
          }));
        
          setClasses(transformedClasses);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const copyTemplate = (template: string, className: string) => {
    if (!template) {
      toast.error('No template available for this class');
      return;
    }
    
    navigator.clipboard.writeText(template)
      .then(() => toast.success(`${className} form template copied to clipboard`))
      .catch(() => toast.error('Failed to copy template'));
  };

  if (loading) {
    return <p>Loading classes...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Classes to be Started</h2>
      <p className="text-muted-foreground mb-6">View details of the classes and their requirements. You can copy the Application form.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold">{cls.name}</h3>
            <p className="text-gray-600 mb-2">{cls.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/application?classCode=${cls.code}`} className="inline-block mt-1 bg-islamic-primary text-white py-2 px-4 rounded hover:bg-islamic-primary/90 transition-colors">
                Apply Now
              </Link>
              
              {cls.template && (
                <button 
                  onClick={() => copyTemplate(cls.template || '', cls.name)}
                  className="inline-flex items-center mt-1 bg-slate-100 text-slate-700 py-2 px-4 rounded hover:bg-slate-200 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Form
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicClassesList;
