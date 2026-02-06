import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RootRedirect } from "@/components/RootRedirect";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Alerts from "./pages/Alerts";
import Activity from "./pages/Activity";
import Opportunities from "./pages/Opportunities";
import Reports from "./pages/Reports";
import Referrals from "./pages/Referrals";
import Settings from "./pages/Settings";
import TeamUtilizationForm from "./pages/TeamUtilizationForm";
import ClientFeedback from "./pages/ClientFeedback";
import Hiring from "./pages/Hiring";
import FeedbackAnalytics from "./pages/FeedbackAnalytics";
import ClientPortal from "./pages/ClientPortal";
import ClientOnboarding from "./pages/ClientOnboarding";
import EmployeePortal from "./pages/EmployeePortal";
import SmartClientPortal from "./pages/SmartClientPortal";
import WholesalerEmployeePortal from "./pages/WholesalerEmployeePortal";
import Portals from "./pages/Portals";
import EmployeeAuth from "./pages/EmployeeAuth";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientAuth from "./pages/ClientAuth";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import TodayWork from "./pages/TodayWork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute userType="employee">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute userType="employee">
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute userType="employee">
                <ClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portals"
            element={
              <ProtectedRoute userType="employee">
                <Portals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute userType="employee">
                <Alerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute userType="employee">
                <Activity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute userType="employee">
                <Opportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute userType="employee">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute userType="employee">
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute userType="employee">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute userType="any">
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/today-work"
            element={
              <ProtectedRoute userType="employee">
                <TodayWork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-form"
            element={
              <ProtectedRoute userType="employee">
                <TeamUtilizationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-feedback"
            element={
              <ProtectedRoute userType="employee">
                <ClientFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring"
            element={
              <ProtectedRoute userType="employee">
                <Hiring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback-analytics"
            element={
              <ProtectedRoute userType="employee">
                <FeedbackAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute userType="employee">
                <ClientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-onboarding"
            element={
              <ProtectedRoute userType="employee">
                <ClientOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-portal"
            element={
              <ProtectedRoute userType="employee">
                <EmployeePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-portal"
            element={
              <ProtectedRoute userType="client">
                <SmartClientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesaler-portal"
            element={
              <ProtectedRoute userType="employee">
                <WholesalerEmployeePortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-auth"
            element={
              <ProtectedRoute userType="employee">
                <EmployeeAuth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute userType="employee">
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/client-auth" element={<ClientAuth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
