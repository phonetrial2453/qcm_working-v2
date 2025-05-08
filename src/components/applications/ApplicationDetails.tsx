
import React from 'react';
import { Application } from '@/types/application';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ApplicationDetailsProps {
  application: Application;
  formatDate: (dateString: string) => string;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({ 
  application, 
  formatDate
}) => {
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

  return (
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
        
        {/* Removed validation warnings section as it's no longer in the Application type */}
        
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
  );
};

export default ApplicationDetails;
