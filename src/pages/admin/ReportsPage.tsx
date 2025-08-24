import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { useApplications } from '@/contexts/ApplicationContext';
import { BarChart, PieChart, BarChart3, PieChart as PieChartIcon, Download, FileImage } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

const ReportsPage: React.FC = () => {
  const { applications, classes } = useApplications();
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('month');
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const chartRefs = {
    overview: useRef<HTMLDivElement>(null),
    byClass: useRef<HTMLDivElement>(null),
    trends: useRef<HTMLDivElement>(null),
  };
  
  // Monthly applications data - now using real data
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Calculate monthly data from applications
  useEffect(() => {
    const getMonthlyData = () => {
      // Create an object to hold counts for each month
      const monthCounts: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize all months with 0
      months.forEach(month => {
        monthCounts[month] = 0;
      });
      
      // Filter applications by selected class if needed
      const filteredApps = selectedClass === 'all'
        ? applications
        : applications.filter(app => app.classCode === selectedClass);
      
      // Count applications by month
      filteredApps.forEach(app => {
        const date = new Date(app.createdAt); // Fixed: using camelCase property name
        const month = months[date.getMonth()];
        monthCounts[month]++;
      });
      
      // Convert to array format for Recharts
      const data = months.map(month => ({
        name: month,
        applications: monthCounts[month],
      }));
      
      setMonthlyData(data);
    };
    
    getMonthlyData();
  }, [applications, selectedClass]);
  
  // Will be replaced with actual Supabase data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // This would be replaced with actual Supabase queries
        console.log('Fetching report data with filters:', {
          class: selectedClass, 
          dateRange: selectedDateRange
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      }
    };
    
    fetchReportData();
  }, [selectedClass, selectedDateRange]);
  
  // Status distribution data for pie chart
  const filteredApplications = selectedClass === 'all' 
    ? applications 
    : applications.filter(app => app.classCode === selectedClass);
  
  const statusData = [
    { name: 'Approved', value: filteredApplications.filter(app => app.status === 'approved').length, color: '#10b981' },
    { name: 'Pending', value: filteredApplications.filter(app => app.status === 'pending').length, color: '#f59e0b' },
    { name: 'Rejected', value: filteredApplications.filter(app => app.status === 'rejected').length, color: '#ef4444' },
  ];
  
  // Class distribution data for bar chart
  const classData = classes.map(cls => ({
    name: cls.code,
    Total: applications.filter(app => app.classCode === cls.code).length,
    Approved: applications.filter(app => app.classCode === cls.code && app.status === 'approved').length,
    Pending: applications.filter(app => app.classCode === cls.code && app.status === 'pending').length,
    Rejected: applications.filter(app => app.classCode === cls.code && app.status === 'rejected').length,
  }));
  
  // Get stats for overview cards
  const totalApplications = filteredApplications.length;
  const approvedApplications = filteredApplications.filter(app => app.status === 'approved').length;
  const pendingApplications = filteredApplications.filter(app => app.status === 'pending').length;
  const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected').length;
  
  const approvalRate = totalApplications 
    ? Math.round((approvedApplications / totalApplications) * 100) 
    : 0;

  // Reference batch analysis
  const batchData = filteredApplications.reduce((acc: Record<string, number>, app) => {
    const batch = app.referredBy?.batch || 'Unknown';
    acc[batch] = (acc[batch] || 0) + 1;
    return acc;
  }, {});

  const batchChartData = Object.entries(batchData).map(([name, value]) => ({
    name,
    applications: value,
  }));
    
  const handleExportReport = () => {
    const activeTab = selectedTab;
    const chartRef = chartRefs[activeTab as keyof typeof chartRefs];
    
    if (!chartRef.current) {
      toast.error('Chart not found for export');
      return;
    }
    
    try {
      // Use html2canvas to capture the chart (would need to be imported)
      import('html2canvas').then((html2canvas) => {
        html2canvas.default(chartRef.current!).then(canvas => {
          // Convert to downloadable image
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${activeTab}-report-${new Date().toISOString().slice(0, 10)}.png`;
          link.href = imgData;
          link.click();
          toast.success('Report exported successfully');
        });
      }).catch(err => {
        console.error('Error loading html2canvas:', err);
        toast.error('Failed to export report');
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };
  
  return (
    <AppLayout adminOnly>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-islamic-primary">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              View and analyze application statistics
            </p>
          </div>
          
          <Button 
            variant="outline"
            onClick={handleExportReport}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.code} value={cls.code}>
                  {cls.name} ({cls.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {selectedDateRange === 'all' ? 'All time' : `Last ${selectedDateRange}`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedApplications}</div>
              <p className="text-xs text-muted-foreground">
                {approvalRate}% approval rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                {totalApplications ? Math.round((pendingApplications / totalApplications) * 100) : 0}% pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedApplications}</div>
              <p className="text-xs text-muted-foreground">
                {totalApplications ? Math.round((rejectedApplications / totalApplications) * 100) : 0}% rejected
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-class">By Class</TabsTrigger>
            <TabsTrigger value="by-batch">By Reference Batch</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={chartRefs.overview}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5" />
                    Application Status Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of applications by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Monthly Applications
                  </CardTitle>
                  <CardDescription>
                    Applications received per month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="by-class" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Applications by Class
                </CardTitle>
                <CardDescription>
                  Breakdown of applications for each class
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={classData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Approved" stackId="a" fill="#10b981" />
                    <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Rejected" stackId="a" fill="#ef4444" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-batch" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Applications by Reference Batch
                </CardTitle>
                <CardDescription>
                  Breakdown of applications by referring batch
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={batchChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#3b82f6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>
                  View application trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">
                  Detailed trends analysis would be implemented here, showing application 
                  patterns, acceptance rates, and other metrics over time.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
