
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { QuranProvider } from "./contexts/QuranContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import StatusCheckPage from "./pages/StatusCheckPage";
import NewApplicationPage from "./pages/applications/NewApplicationPage";
import ApplicationsListPage from "./pages/applications/ApplicationsListPage";
import ApplicationDetailPage from "./pages/applications/ApplicationDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/check-status" element={<StatusCheckPage />} />
                
                {/* Application Routes */}
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/new" element={<NewApplicationPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* 404 Route */}
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
