
import { Application } from '@/types/application';
import { toast } from 'sonner';

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const exportToCSV = (applications: Application[]) => {
  const headers = [
    'ID', 'Name', 'Email', 'Mobile', 'Class', 'Status', 'Date'
  ];
  
  const rows = applications.map(app => [
    app.id,
    app.studentDetails?.fullName || '',
    app.otherDetails?.email || '',
    app.studentDetails?.mobile || '',
    app.classCode,
    app.status,
    formatDate(app.createdAt)
  ]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `applications-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('CSV report exported successfully');
};

export const exportToImage = (tableRef: React.RefObject<HTMLDivElement>) => {
  if (!tableRef.current) {
    toast.error('Table not found for export');
    return;
  }
  
  try {
    // Use html2canvas to capture the table
    import('html2canvas').then((html2canvas) => {
      html2canvas.default(tableRef.current!).then(canvas => {
        // Convert to downloadable image
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `applications-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = imgData;
        link.click();
        toast.success('Applications report exported as image');
      });
    }).catch(err => {
      console.error('Error loading html2canvas:', err);
      toast.error('Failed to export report as image');
    });
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export report');
  }
};
