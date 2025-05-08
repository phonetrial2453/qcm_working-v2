import React from 'react';
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
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  const exportToPDF = async () => {
    if (!contentRef.current) {
      toast.error("Unable to generate PDF");
      return;
    }
    
    try {
      toast.info("Generating PDF...");
      
      // Create a hidden clone of the content with proper styling for PDF
      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = contentRef.current.innerHTML;
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.background = '#ffffff';
      pdfContent.style.padding = '20px';
      pdfContent.style.width = '800px';
      pdfContent.style.fontSize = '12px';
      pdfContent.style.color = '#000000';
      document.body.appendChild(pdfContent);
      
      // Generate canvas from the styled DOM
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      // Clean up the temporary DOM element
      document.body.removeChild(pdfContent);
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`Application: ${application.id}`, 20, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        10,
        40,
        imgWidth - 20,
        imgHeight
      );
      
      // If content extends beyond a single page, add more pages
      let heightLeft = imgHeight;
      let position = 40; // Starting position
      
      while (heightLeft >= pageHeight - position) {
        // Add new page
        pdf.addPage();
        position = 0; // Reset position for new page
        
        // Add content to the new page with appropriate offset
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          10,
          -(pageHeight - 40), // Negative offset to show next part
          imgWidth - 20,
          imgHeight
        );
        
        // Reduce remaining height
        heightLeft -= (pageHeight - position);
      }
      
      // Save the PDF
      pdf.save(`application-${application.id}.pdf`);
      toast.success("PDF downloaded successfully");
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Try again or contact support.");
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
              <p className="pl-4 whitespace-pre-line">{application.remarks}</p>
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
