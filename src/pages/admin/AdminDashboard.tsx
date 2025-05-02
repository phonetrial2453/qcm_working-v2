
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, BarChart, School } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: "Moderator Management",
      description: "Add, edit, or remove moderators and their access permissions.",
      icon: <Users className="h-8 w-8 text-islamic-primary mb-2" />,
      action: () => navigate("/admin/moderators"),
      buttonText: "Manage Moderators"
    },
    {
      title: "Class Management",
      description: "Manage classes, including settings, templates, and validation rules.",
      icon: <School className="h-8 w-8 text-islamic-primary mb-2" />,
      action: () => navigate("/admin/classes"),
      buttonText: "Manage Classes"
    },
    {
      title: "Application Management",
      description: "View, process, and manage student applications.",
      icon: <BookOpen className="h-8 w-8 text-islamic-primary mb-2" />,
      action: () => navigate("/applications"),
      buttonText: "View Applications"
    },
    {
      title: "Reports & Analytics",
      description: "Generate reports and view analytics on applications and classes.",
      icon: <BarChart className="h-8 w-8 text-islamic-primary mb-2" />,
      action: () => navigate("/admin/reports"),
      buttonText: "View Reports"
    }
  ];

  return (
    <AppLayout adminOnly>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-islamic-primary">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {dashboardItems.map((item, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start">
                  {item.icon}
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  onClick={item.action} 
                  className="w-full bg-islamic-primary hover:bg-islamic-primary/90"
                >
                  {item.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
