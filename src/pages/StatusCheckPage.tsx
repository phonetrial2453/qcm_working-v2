import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Search, Copy, ArrowRight } from 'lucide-react';

const StatusCheckPage: React.FC = () => {
  const [applicationId, setApplicationId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { applications } = useApplications();
  const navigate = useNavigate();
  
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    application?: any;
  } | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationId.trim()) {
      toast.error('Please enter an application ID');
      return;
    }
    
    setIsSearching(true);
    
    // Simulate network delay
    setTimeout(() => {
      const application = applications.find(app => app.id === applicationId);
      
      setSearchResult({
        found: !!application,
        application,
      });
      
      if (!application) {
        toast.error(`No application found with ID: ${applicationId}`);
      }
      
      setIsSearching(false);
    }, 500);
  };
  
  const copyToClipboard = () => {
    if (!searchResult?.application) return;
    
    const app = searchResult.application;
    const statusInfo = `
Application ID: ${app.id}
Name: ${app.studentDetails?.fullName || 'Unknown'}
Mobile: ${app.studentDetails?.mobile || 'N/A'}
Status: ${app.status.toUpperCase()}
${app.remarks ? `Remarks: ${app.remarks}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(statusInfo)
      .then(() => toast.success('Status info copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
    }
  };

  return (
    <AppLayout requireAuth={false}>
      <div className="container mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-islamic-primary">Check Application Status</h1>
          <p className="text-muted-foreground">
            Enter your application ID to check its current status
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Enter the application ID you received after submitting your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="application-id">Application ID</Label>
                <div className="flex">
                  <Input
                    id="application-id"
                    placeholder="e.g., QRAN0001"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="ml-2 bg-islamic-primary hover:bg-islamic-primary/90"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Check'}
                    {!isSearching && <Search className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Application IDs typically start with a 4-letter class code followed by a 4-digit number
                </p>
              </div>
            </form>
            
            {searchResult && (
              <div className="mt-6">
                {searchResult.found && searchResult.application ? (
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{searchResult.application.studentDetails?.fullName || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">ID: {searchResult.application.id}</p>
                      </div>
                      {getStatusBadge(searchResult.application.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Class:</p>
                        <p>{searchResult.application.classCode}</p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Mobile:</p>
                        <p>{searchResult.application.studentDetails?.mobile || 'N/A'}</p>
                      </div>
                      
                      {searchResult.application.remarks && (
                        <div>
                          <p className="text-muted-foreground">Remarks:</p>
                          <p>{searchResult.application.remarks}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Info
                      </Button>
                      <Button 
                        className="flex-1 bg-islamic-primary hover:bg-islamic-primary/90"
                        onClick={() => navigate(`/applications/${searchResult.application?.id}`)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p>No application found with ID: {applicationId}</p>
                    <p className="text-sm mt-1">Please check the ID and try again.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StatusCheckPage;
