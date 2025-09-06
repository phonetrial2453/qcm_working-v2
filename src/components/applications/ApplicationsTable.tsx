
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Eye, Filter } from 'lucide-react';
import { Application } from '@/types/application';
import { ColumnVisibilityToggle } from '@/components/admin/ColumnVisibilityToggle';

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
}

interface ApplicationsTableProps {
  applications: Application[];
  isAdmin: boolean;
  onChangeStatus: (applicationId: string) => void;
  formatDate: (date: string) => string;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  isAdmin,
  onChangeStatus,
  formatDate,
}) => {
  const navigate = useNavigate();
  
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'id', label: 'ID', visible: true },
    { key: 'name', label: 'Name', visible: true },
    { key: 'mobile', label: 'Mobile', visible: true },
    { key: 'email', label: 'Email', visible: false },
    { key: 'whatsapp', label: 'WhatsApp', visible: false },
    { key: 'age', label: 'Age', visible: false },
    { key: 'qualification', label: 'Qualification', visible: false },
    { key: 'profession', label: 'Profession', visible: false },
    { key: 'hometownArea', label: 'Hometown Area', visible: false },
    { key: 'hometownCity', label: 'Hometown City', visible: false },
    { key: 'hometownDistrict', label: 'Hometown District', visible: false },
    { key: 'hometownState', label: 'Hometown State', visible: false },
    { key: 'currentArea', label: 'Current Area', visible: false },
    { key: 'currentMandal', label: 'Current Mandal', visible: false },
    { key: 'currentCity', label: 'Current City', visible: false },
    { key: 'currentState', label: 'Current State', visible: false },
    { key: 'referrerName', label: 'Referrer Name', visible: false },
    { key: 'referrerMobile', label: 'Referrer Mobile', visible: false },
    { key: 'referrerBatch', label: 'Referrer Batch', visible: false },
    { key: 'referrerStudentId', label: 'Referrer Student ID', visible: false },
    { key: 'remarks', label: 'Remarks', visible: false },
    { key: 'callResponse', label: 'Call Response', visible: false },
    { key: 'studentNature', label: 'Student Nature', visible: false },
    { key: 'studentCategory', label: 'Student Category', visible: false },
    { key: 'followUpBy', label: 'Follow Up By', visible: false },
    { key: 'naqeeb', label: 'Naqeeb', visible: false },
    { key: 'naqeebResponse', label: 'Naqeeb Response', visible: false },
    { key: 'class', label: 'Class', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'submitted', label: 'Submitted', visible: true },
    { key: 'actions', label: 'Actions', visible: true },
  ]);

  // Load column preferences from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem('applicationTableColumns');
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns));
    }
  }, []);

  const handleColumnToggle = (key: string) => {
    const updatedColumns = columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    setColumns(updatedColumns);
    localStorage.setItem('applicationTableColumns', JSON.stringify(updatedColumns));
  };

  const getVisibleColumns = () => columns.filter(col => col.visible);

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

  const visibleColumns = getVisibleColumns();
  const colSpan = visibleColumns.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Applications</CardTitle>
        {isAdmin && (
          <ColumnVisibilityToggle
            columns={columns}
            onToggle={handleColumnToggle}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map(col => (
                  <TableHead 
                    key={col.key} 
                    className={col.key === 'actions' ? 'text-right' : ''}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map(application => (
                  <TableRow key={application.id}>
                    {visibleColumns.map(col => {
                      switch (col.key) {
                        case 'id':
                          return <TableCell key={col.key} className="font-medium">{application.id}</TableCell>;
                        case 'name':
                          return <TableCell key={col.key}>{application.studentDetails?.fullName || 'Unknown'}</TableCell>;
                        case 'mobile':
                          return <TableCell key={col.key}>{application.studentDetails?.mobile || 'N/A'}</TableCell>;
                        case 'email':
                          return <TableCell key={col.key}>{application.otherDetails?.email || 'N/A'}</TableCell>;
                        case 'class':
                          return <TableCell key={col.key}>{application.classCode}</TableCell>;
                        case 'status':
                          return <TableCell key={col.key}>{getStatusBadge(application.status)}</TableCell>;
                        case 'submitted':
                          return <TableCell key={col.key}>{formatDate(application.createdAt)}</TableCell>;
                        case 'qualification':
                          return <TableCell key={col.key}>{application.otherDetails?.qualification || 'N/A'}</TableCell>;
                        case 'profession':
                          return <TableCell key={col.key}>{application.otherDetails?.profession || 'N/A'}</TableCell>;
                        case 'age':
                          return <TableCell key={col.key}>{application.otherDetails?.age || 'N/A'}</TableCell>;
                        case 'whatsapp':
                          return <TableCell key={col.key}>{application.studentDetails?.whatsapp || 'N/A'}</TableCell>;
                        case 'hometownArea':
                          return <TableCell key={col.key}>{application.hometownDetails?.area || 'N/A'}</TableCell>;
                        case 'hometownCity':
                          return <TableCell key={col.key}>{application.hometownDetails?.city || 'N/A'}</TableCell>;
                        case 'hometownDistrict':
                          return <TableCell key={col.key}>{application.hometownDetails?.district || 'N/A'}</TableCell>;
                        case 'hometownState':
                          return <TableCell key={col.key}>{application.hometownDetails?.state || 'N/A'}</TableCell>;
                        case 'currentArea':
                          return <TableCell key={col.key}>{application.currentResidence?.area || 'N/A'}</TableCell>;
                        case 'currentMandal':
                          return <TableCell key={col.key}>{application.currentResidence?.mandal || 'N/A'}</TableCell>;
                        case 'currentCity':
                          return <TableCell key={col.key}>{application.currentResidence?.city || 'N/A'}</TableCell>;
                        case 'currentState':
                          return <TableCell key={col.key}>{application.currentResidence?.state || 'N/A'}</TableCell>;
                        case 'referrerName':
                          return <TableCell key={col.key}>{application.referredBy?.fullName || 'N/A'}</TableCell>;
                        case 'referrerMobile':
                          return <TableCell key={col.key}>{application.referredBy?.mobile || 'N/A'}</TableCell>;
                        case 'referrerBatch':
                          return <TableCell key={col.key}>{application.referredBy?.batch || 'N/A'}</TableCell>;
                        case 'referrerStudentId':
                          return <TableCell key={col.key}>{application.referredBy?.studentId || 'N/A'}</TableCell>;
                        case 'remarks':
                          return <TableCell key={col.key} className="max-w-[200px] truncate">{application.remarks || 'N/A'}</TableCell>;
                        case 'callResponse':
                          return <TableCell key={col.key} className="max-w-[200px] truncate">{application.callResponse || 'N/A'}</TableCell>;
                        case 'studentNature':
                          return <TableCell key={col.key}>{application.studentNature || 'N/A'}</TableCell>;
                        case 'studentCategory':
                          return <TableCell key={col.key}>{application.studentCategory || 'N/A'}</TableCell>;
                        case 'followUpBy':
                          return <TableCell key={col.key}>{application.followUpBy || 'N/A'}</TableCell>;
                        case 'naqeeb':
                          return <TableCell key={col.key}>{application.naqeeb || 'N/A'}</TableCell>;
                        case 'naqeebResponse':
                          return <TableCell key={col.key} className="max-w-[200px] truncate">{application.naqeebResponse || 'N/A'}</TableCell>;
                        case 'actions':
                          return (
                            <TableCell key={col.key} className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => navigate(`/applications/${application.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {isAdmin && (
                                    <DropdownMenuItem onClick={() => onChangeStatus(application.id)}>
                                      <Filter className="h-4 w-4 mr-2" />
                                      Change Status
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          );
                        default:
                          return null;
                      }
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-6 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
