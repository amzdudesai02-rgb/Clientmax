import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/portals" element={<Portals />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/team-form" element={<TeamUtilizationForm />} />
          <Route path="/client-feedback" element={<ClientFeedback />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/feedback-analytics" element={<FeedbackAnalytics />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/client-onboarding" element={<ClientOnboarding />} />
          <Route path="/employee-portal" element={<EmployeePortal />} />
          <Route path="/smart-portal" element={<SmartClientPortal />} />
          <Route path="/wholesaler-portal" element={<WholesalerEmployeePortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee-auth" element={<EmployeeAuth />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/client-auth" element={<ClientAuth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
