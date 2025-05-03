
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ApplicationPDFExport from '@/components/applications/ApplicationPDFExport';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Copy, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Application, ApplicationStatus } from '@/types/application';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { applications, updateApplication, fetchApplications } = useApplications();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  
  // Find the application by id
  const application = id ? applications.find(app => app.id === id) : undefined;
  
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('pending');
  const [remarks, setRemarks] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Fetch applications data when component mounts
    const loadData = async () => {
      try {
        await fetchApplications();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchApplications]);
  
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 mx-auto bg-muted rounded-full mb-4"></div>
            <div className="h-6 w-48 mx-auto bg-muted rounded mb-2"></div>
            <div className="h-4 w-64 mx-auto bg-muted rounded mb-6"></div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!application) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Application Not Found</h1>
          <p className="text-muted-foreground mb-6">The application with ID {id} could not be found.</p>
          <Button onClick={() => navigate('/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (application.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Status badge
  const getStatusBadge = () => {
    switch (application.status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>;
    }
  };
  
  // Handle status update
  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    
    updateApplication(application.id, {
      status: newStatus,
      remarks: remarks,
      updatedAt: new Date().toISOString(),
    })
      .then((result) => {
        if (result) {
          setOpenDialog(false);
          toast.success(`Application status updated to ${newStatus}`);
        }
      })
      .catch(err => {
        console.error("Error updating application:", err);
        toast.error("Failed to update application status");
      });
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    const statusInfo = `
Application ID: ${application.id}
Name: ${application.studentDetails?.fullName || 'Unknown'}
Mobile: ${application.studentDetails?.mobile || 'N/A'}
Status: ${application.status.toUpperCase()}
${application.remarks ? `Remarks: ${application.remarks}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(statusInfo)
      .then(() => toast.success('Status info copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            className="w-fit p-0 h-auto"
            onClick={() => navigate('/applications')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Status
            </Button>
            <ApplicationPDFExport application={application} />
            {isAdmin && (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-islamic-primary hover:bg-islamic-primary/90">
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Application Status</DialogTitle>
                    <DialogDescription>
                      Change the status of application {application.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={newStatus} 
                        onValueChange={(value: ApplicationStatus) => setNewStatus(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        placeholder="Add remarks or reasons for this status update"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStatusUpdate}
                      className="bg-islamic-primary hover:bg-islamic-primary/90"
                    >
                      Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Application {application.id}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submitted on {formatDate(application.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {application.remarks && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <h3 className="font-medium mb-1">Remarks</h3>
                <p className="text-sm">{application.remarks}</p>
              </div>
            )}
            
            {/* Show validation warnings if they exist */}
            {application.validationWarnings && application.validationWarnings.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-md">
                <h3 className="font-medium mb-1 text-amber-800">Validation Warnings</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {application.validationWarnings.map((warning, index) => (
                    <li key={index}>• {warning.field}: {warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-islamic-primary mb-3">Student Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{application.studentDetails?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile Number</p>
                    <p className="font-medium">{application.studentDetails?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp Number</p>
                    <p className="font-medium">{application.studentDetails?.whatsapp}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-semibold text-islamic-primary mb-3">Hometown Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Area/Locality</p>
                    <p className="font-medium">{application.hometownDetails?.area}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{application.hometownDetails?.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">District</p>
                    <p className="font-medium">{application.hometownDetails?.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{application.hometownDetails?.state}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-islamic-primary mb-3">Current Residence</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Area/Locality</p>
                    <p className="font-medium">{application.currentResidence?.area}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mandal</p>
                    <p className="font-medium">{application.currentResidence?.mandal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{application.currentResidence?.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{application.currentResidence?.state}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-semibold text-islamic-primary mb-3">Other Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{application.otherDetails?.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Qualification</p>
                    <p className="font-medium">{application.otherDetails?.qualification}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profession</p>
                    <p className="font-medium">{application.otherDetails?.profession}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                    <p className="font-medium">{application.otherDetails?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-semibold text-islamic-primary mb-3">Referred By</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{application.referredBy?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium">{application.referredBy?.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID#</p>
                  <p className="font-medium">{application.referredBy?.studentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch#</p>
                  <p className="font-medium">{application.referredBy?.batch || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Additional fields - shown only if they have values */}
            {(application.callResponse || 
              application.studentNature || 
              application.studentCategory || 
              application.followUpBy || 
              application.naqeeb || 
              application.naqeebResponse) && (
              <>
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-semibold text-islamic-primary mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.callResponse && (
                      <div>
                        <p className="text-sm text-muted-foreground">Call Response</p>
                        <p className="font-medium">{application.callResponse}</p>
                      </div>
                    )}
                    {application.studentNature && (
                      <div>
                        <p className="text-sm text-muted-foreground">Student Nature</p>
                        <p className="font-medium">{application.studentNature}</p>
                      </div>
                    )}
                    {application.studentCategory && (
                      <div>
                        <p className="text-sm text-muted-foreground">Student Category</p>
                        <p className="font-medium">{application.studentCategory}</p>
                      </div>
                    )}
                    {application.followUpBy && (
                      <div>
                        <p className="text-sm text-muted-foreground">Follow-up By</p>
                        <p className="font-medium">{application.followUpBy}</p>
                      </div>
                    )}
                    {application.naqeeb && (
                      <div>
                        <p className="text-sm text-muted-foreground">Naqeeb</p>
                        <p className="font-medium">{application.naqeeb}</p>
                      </div>
                    )}
                    {application.naqeebResponse && (
                      <div>
                        <p className="text-sm text-muted-foreground">Naqeeb Response</p>
                        <p className="font-medium">{application.naqeebResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ApplicationDetailPage;
