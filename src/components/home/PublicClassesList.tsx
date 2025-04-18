
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Copy, Book, Check, FileText } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { ValidationRules } from '@/types/supabase-types';

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  validation_rules?: ValidationRules;
}

const applicationTemplate = (classCode: string) => {
  return `
APPLICATION FORM - ${classCode}

STUDENT DETAILS:
Full Name: 
Mobile Number: 
WhatsApp Number: 

HOMETOWN DETAILS:
Area: 
City: 
District: 
State: 

CURRENT RESIDENCE:
Area: 
Mandal: 
City: 
State: 

OTHER DETAILS:
Age: 
Qualification: 
Profession: 
Email: 

REFERRED BY:
Full Name: 
Mobile Number: 
Student ID (if applicable): 
Batch: 
  `;
};

const PublicClassesList: React.FC = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name');

        if (error) throw error;
        
        setClasses(data || []);
      } catch (error: any) {
        console.error('Error fetching classes:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const copyApplicationFormat = (classCode: string) => {
    navigator.clipboard.writeText(applicationTemplate(classCode))
      .then(() => {
        setCopiedClass(classCode);
        toast.success('Application format copied to clipboard');
        setTimeout(() => setCopiedClass(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy application format');
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse">Loading available classes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-islamic-primary mb-6">Available Classes</h2>
      
      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No classes are currently available.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {classes.map((cls) => (
            <AccordionItem value={cls.id} key={cls.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                <div className="flex items-center text-left">
                  <Book className="mr-2 h-5 w-5 text-islamic-primary" />
                  <div>
                    <h3 className="font-medium">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground">Code: {cls.code}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {cls.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{cls.description}</p>
                    </div>
                  )}
                  
                  {cls.validation_rules && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Requirements</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Age: {cls.validation_rules.ageRange.min} - {cls.validation_rules.ageRange.max} years</li>
                        {cls.validation_rules.minimumQualification && (
                          <li>Minimum Qualification: {cls.validation_rules.minimumQualification}</li>
                        )}
                        <li>Eligible States: {cls.validation_rules.allowedStates.join(', ')}</li>
                      </ul>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 bg-islamic-primary/10 hover:bg-islamic-primary/20 text-islamic-primary border-islamic-primary/30"
                    onClick={() => copyApplicationFormat(cls.code)}
                  >
                    {copiedClass === cls.code ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Application Format
                      </>
                    )}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default PublicClassesList;
