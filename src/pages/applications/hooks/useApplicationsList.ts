
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApplications } from '@/contexts/ApplicationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Application } from '@/types/application';

export const useApplicationsList = () => {
  const { applications, classes, fetchApplications } = useApplications();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(applications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  
  // Get class code from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classParam = params.get('class');
    if (classParam) {
      setClassFilter(classParam);
    }
  }, [location.search]);
  
  // Filter applications
  useEffect(() => {
    let filtered = [...applications];
    
    // Important: First filter by user's assigned classes
    if (!isAdmin && user?.classes) {
      filtered = filtered.filter(app => user.classes?.includes(app.classCode));
    }
    
    if (classFilter && classFilter !== 'all') {
      filtered = filtered.filter(app => app.classCode === classFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.id.toLowerCase().includes(term) ||
        (app.studentDetails?.fullName || '').toLowerCase().includes(term) ||
        (app.studentDetails?.mobile || '').includes(term) ||
        (app.otherDetails?.email || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, user, isAdmin, searchTerm, statusFilter, classFilter]);

  const accessibleClasses = isAdmin 
    ? classes 
    : classes.filter(cls => user?.classes?.includes(cls.code));

  return {
    filteredApplications,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    classFilter,
    setClassFilter,
    accessibleClasses,
    fetchApplications,
    isAdmin
  };
};
