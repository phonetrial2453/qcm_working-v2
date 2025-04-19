import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Info } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ClassRecord, ValidationRules } from '@/types/supabase-types';

interface ClassInfo extends ClassRecord {
  description: string;
}

const PublicClassesList: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');

      if (error) throw error;
      
      if (data) {
        const formattedClasses: ClassInfo[] = data.map(cls => ({
          ...cls,
          description: cls.description || '',
        }));
        
        setClasses(formattedClasses);
      }
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyClassInfo = (classInfo: ClassInfo) => {
    const requirements = [];
    
    if (classInfo.validation_rules?.ageRange) {
      requirements.push(`Age Range: ${classInfo.validation_rules.ageRange.min} - ${classInfo.validation_rules.ageRange.max} years`);
    }
    
    if (classInfo.validation_rules?.minimumQualification) {
      requirements.push(`Minimum Qualification: ${classInfo.validation_rules.minimumQualification}`);
    }
    
    if (classInfo.validation_rules?.allowedStates && classInfo.validation_rules.allowedStates.length > 0) {
      requirements.push(`Eligible States: ${classInfo.validation_rules.allowedStates.join(', ')}`);
    }
    
    const classDetails = `
Class: ${classInfo.name} (${classInfo.code})
Description: ${classInfo.description || 'No description available'}

Requirements:
${requirements.length > 0 ? requirements.map(req => `- ${req}`).join('\n') : '- No specific requirements listed'}

To apply for this class, please register and submit an application through our portal.
    `.trim();
    
    navigator.clipboard.writeText(classDetails);
    toast.success('Class information copied to clipboard');
  };
  
  const copyApplicationTemplate = (classInfo: ClassInfo) => {
    if (!classInfo.template) {
      toast.error('No application template available for this class');
      return;
    }
    
    navigator.clipboard.writeText(classInfo.template);
    toast.success('Application template copied to clipboard');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-islamic-primary">Available Classes</CardTitle>
        <CardDescription>
          View available classes and their requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-islamic-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.length > 0 ? (
              classes.map((classInfo) => (
                <Card key={classInfo.id || classInfo.code} className="overflow-hidden">
                  <CardHeader className="bg-islamic-primary/5 pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl">{classInfo.name}</CardTitle>
                        <p className="text-sm font-mono text-muted-foreground">Code: {classInfo.code}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyClassInfo(classInfo)} title="Copy class information">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{classInfo.description || 'No description available'}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1">
                        <Info className="h-3 w-3" /> Requirements
                      </h4>
                      <ul className="text-xs space-y-1">
                        {classInfo.validation_rules?.ageRange && (
                          <li>
                            Age: {classInfo.validation_rules.ageRange.min} - {classInfo.validation_rules.ageRange.max} years
                          </li>
                        )}
                        {classInfo.validation_rules?.minimumQualification && (
                          <li>Qualification: {classInfo.validation_rules.minimumQualification}</li>
                        )}
                        {classInfo.validation_rules?.allowedStates && classInfo.validation_rules.allowedStates.length > 0 && (
                          <li>
                            Eligible States: {classInfo.validation_rules.allowedStates.slice(0, 3).join(', ')}
                            {classInfo.validation_rules.allowedStates.length > 3 && ` and ${classInfo.validation_rules.allowedStates.length - 3} more`}
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 px-6 pb-4 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => copyClassInfo(classInfo)}>
                      <Info className="h-4 w-4 mr-2" /> Copy Info
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => copyApplicationTemplate(classInfo)}>
                      <Copy className="h-4 w-4 mr-2" /> Copy Template
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No classes are currently available.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicClassesList;
