import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Application } from '@/types/application';

interface BatchReportChartProps {
  applications: Application[];
}

export const BatchReportChart: React.FC<BatchReportChartProps> = ({ applications }) => {
  const batchData = useMemo(() => {
    // Group applications by reference batch
    const batchGroups: Record<string, { total: number; approved: number; pending: number; rejected: number }> = {};
    
    applications.forEach(app => {
      const batch = app.referredBy?.batch || 'No Batch';
      
      if (!batchGroups[batch]) {
        batchGroups[batch] = { total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      
      batchGroups[batch].total++;
      batchGroups[batch][app.status as keyof typeof batchGroups[typeof batch]]++;
    });
    
    // Convert to array format for chart
    return Object.entries(batchGroups)
      .map(([batch, counts]) => ({
        name: batch,
        Total: counts.total,
        Approved: counts.approved,
        Pending: counts.pending,
        Rejected: counts.rejected,
      }))
      .sort((a, b) => b.Total - a.Total) // Sort by total applications descending
      .slice(0, 10); // Show top 10 batches
  }, [applications]);

  const exportBatchReport = () => {
    // Create CSV content
    const headers = ['Batch', 'Total Applications', 'Approved', 'Pending', 'Rejected', 'Approval Rate'];
    const csvContent = [
      headers.join(','),
      ...batchData.map(batch => [
        batch.name,
        batch.Total,
        batch.Approved,
        batch.Pending,
        batch.Rejected,
        `${batch.Total > 0 ? Math.round((batch.Approved / batch.Total) * 100) : 0}%`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (batchData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No batch data available for the selected applications.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Top Reference Batches</h3>
        <Button variant="outline" size="sm" onClick={exportBatchReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Batch Report
        </Button>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={batchData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => `Batch: ${label}`}
          />
          <Legend />
          <Bar dataKey="Approved" stackId="a" fill="#10b981" />
          <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Rejected" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">Batch Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batchData.slice(0, 6).map(batch => {
            const approvalRate = batch.Total > 0 ? Math.round((batch.Approved / batch.Total) * 100) : 0;
            return (
              <div key={batch.name} className="border rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">{batch.name}</h5>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Total: {batch.Total}</div>
                  <div>Approved: {batch.Approved} ({approvalRate}%)</div>
                  <div>Pending: {batch.Pending}</div>
                  <div>Rejected: {batch.Rejected}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};