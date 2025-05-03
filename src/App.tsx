
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApplicationProvider } from "@/contexts/ApplicationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QuranProvider } from "@/contexts/QuranContext";

// Public Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/SignupPage";
import StatusCheckPage from "@/pages/StatusCheckPage";
import NotFound from "@/pages/NotFound";

// Protected Pages
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";

// Application Pages
import ApplicationsListPage from "@/pages/applications/ApplicationsListPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import NewApplicationPage from "@/pages/applications/NewApplicationPage";
import ApplicationPage from "@/pages/ApplicationPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ModeratorManagementPage from "@/pages/admin/ModeratorManagementPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import ClassesPage from "@/pages/admin/ClassesPage";
import ClassSettingsPage from "@/pages/admin/ClassSettingsPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ApplicationProvider>
          <QuranProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/check-status" element={<StatusCheckPage />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                <Route path="/apply" element={<ApplicationPage />} />
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/new" element={<NewApplicationPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/moderators" element={<ModeratorManagementPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="/admin/classes" element={<ClassesPage />} />
                <Route path="/admin/classes/:id" element={<ClassSettingsPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </QuranProvider>
        </ApplicationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
