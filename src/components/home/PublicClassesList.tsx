
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

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
      <h2 className="text-2xl font-semibold mb-4">Available Classes</h2>
      <p className="text-muted-foreground mb-6">View details of the classes and their requirements.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">{cls.name}</h3>
            <p className="text-gray-600 mb-4">{cls.description}</p>
            
            {/* Requirements Section */}
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-islamic-primary">Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {cls.validationRules?.ageRange && (
                  <li>
                    Age: {cls.validationRules.ageRange.min || '0'} - {cls.validationRules.ageRange.max || 'No limit'} years
                  </li>
                )}
                {cls.validationRules?.allowedStates && cls.validationRules.allowedStates.length > 0 && (
                  <li>
                    Available in: {cls.validationRules.allowedStates.join(', ')}
                  </li>
                )}
                {cls.validationRules?.minimumQualification && (
                  <li>
                    Minimum Qualification: {cls.validationRules.minimumQualification}
                  </li>
                )}
              </ul>
            </div>
            
            {cls.template && (
              <button 
                onClick={() => copyTemplate(cls.template || '', cls.name)}
                className="inline-flex items-center mt-1 bg-slate-100 text-slate-700 py-2 px-4 rounded hover:bg-slate-200 transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Form Template
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicClassesList;
