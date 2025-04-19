
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  template?: string;
  validation_rules?: {
    ageRange?: {
      min?: number;
      max?: number;
    };
    allowedStates?: string[];
    minimumQualification?: string;
  };
}

const PublicClassesList: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*');
      
      if (error) throw error;
      
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const copyTemplateToClipboard = (classCode: string, template: string) => {
    navigator.clipboard.writeText(template);
    setCopiedClass(classCode);
    toast.success('Application form copied to clipboard');
    
    // Reset the copied status after 3 seconds
    setTimeout(() => {
      setCopiedClass(null);
    }, 3000);
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-islamic-primary">Classes to be Started</h2>
        <p className="text-muted-foreground">
          View details of the classes and their requirements. You can copy the Application form.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-islamic-primary border-t-transparent"></div>
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No classes available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classInfo => (
            <Card key={classInfo.id}>
              <CardHeader>
                <CardTitle>{classInfo.name}</CardTitle>
                <CardDescription>Code: {classInfo.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{classInfo.description || 'No description available'}</p>
                
                {classInfo.validation_rules && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Requirements:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      {classInfo.validation_rules.ageRange && (
                        <li>
                          Age: {classInfo.validation_rules.ageRange.min || 'Any'} - {classInfo.validation_rules.ageRange.max || 'Any'} years
                        </li>
                      )}
                      {classInfo.validation_rules.allowedStates && classInfo.validation_rules.allowedStates.length > 0 && (
                        <li>
                          Locations: {classInfo.validation_rules.allowedStates.join(', ')}
                        </li>
                      )}
                      {classInfo.validation_rules.minimumQualification && (
                        <li>
                          Minimum Qualification: {classInfo.validation_rules.minimumQualification}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {classInfo.template && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => copyTemplateToClipboard(classInfo.code, classInfo.template || '')}
                  >
                    {copiedClass === classInfo.code ? (
                      <>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Form
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicClassesList;
