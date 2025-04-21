
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { QuranProvider } from "./contexts/QuranContext";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import StatusCheckPage from "./pages/StatusCheckPage";
import NewApplicationPage from "./pages/applications/NewApplicationPage";
import ApplicationsListPage from "./pages/applications/ApplicationsListPage";
import ApplicationDetailPage from "./pages/applications/ApplicationDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ModeratorManagementPage from "./pages/admin/ModeratorManagementPage";
import ClassSettingsPage from "./pages/admin/ClassSettingsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ApplicationPage from './pages/ApplicationPage';
import ClassesPage from './pages/admin/ClassesPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ApplicationProvider>
        <QuranProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/check-status" element={<StatusCheckPage />} />
                
                {/* Modified application routes - only accessible via admin/moderator */}
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/applications/new" element={<NewApplicationPage />} />
                
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/moderators" element={<ModeratorManagementPage />} />
                <Route path="/admin/classes" element={<ClassesPage />} />
                <Route path="/admin/classes/new" element={<ClassSettingsPage />} />
                <Route path="/admin/classes/edit/:classCode" element={<ClassSettingsPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QuranProvider>
      </ApplicationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
