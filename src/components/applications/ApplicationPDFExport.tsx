
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Application } from '@/types/application';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ApplicationPDFExportProps {
  application: Application;
}

const ApplicationPDFExport: React.FC<ApplicationPDFExportProps> = ({ application }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const exportToPDF = async () => {
    if (!contentRef.current) {
      toast.error("Unable to generate PDF");
      return;
    }
    
    try {
      toast.info("Generating PDF...");
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFillColor(255, 255, 255);
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`Application: ${application.id}`, 20, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        10,
        40,
        imgWidth - 20,
        imgHeight - 20
      );
      
      pdf.save(`application-${application.id}.pdf`);
      toast.success("PDF downloaded successfully");
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };
  
  return (
    <>
      <div className="hidden">
        <div ref={contentRef} className="p-6 bg-white">
          <h1 className="text-2xl font-bold mb-4">Application: {application.id}</h1>
          <div className="mb-6">
            <p><strong>Status:</strong> {application.status}</p>
            <p><strong>Class:</strong> {application.classCode}</p>
            <p><strong>Date:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
          
          {/* Student Details */}
          {application.studentDetails && Object.keys(application.studentDetails).length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Student Details</h2>
              <div className="pl-4">
                {Object.entries(application.studentDetails).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Other Details */}
          {application.otherDetails && Object.keys(application.otherDetails).length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Other Details</h2>
              <div className="pl-4">
                {Object.entries(application.otherDetails).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Hometown Details */}
          {application.hometownDetails && Object.keys(application.hometownDetails).length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Hometown Details</h2>
              <div className="pl-4">
                {Object.entries(application.hometownDetails).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Current Residence */}
          {application.currentResidence && Object.keys(application.currentResidence).length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Current Residence</h2>
              <div className="pl-4">
                {Object.entries(application.currentResidence).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Referred By */}
          {application.referredBy && Object.keys(application.referredBy).length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Referred By</h2>
              <div className="pl-4">
                {Object.entries(application.referredBy).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {String(value)}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Remarks */}
          {application.remarks && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Remarks</h2>
              <p className="pl-4">{application.remarks}</p>
            </div>
          )}
          
          {/* Validation Warnings */}
          {application.validationWarnings && application.validationWarnings.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-amber-600">Validation Warnings</h2>
              <div className="pl-4">
                {application.validationWarnings.map((warning, index) => (
                  <p key={index} className="text-amber-600">• {warning.field}: {warning.message}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="outline"
        className="flex items-center"
        onClick={exportToPDF}
      >
        <FileText className="h-4 w-4 mr-2" />
        Export as PDF
      </Button>
    </>
  );
};

export default ApplicationPDFExport;
