import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RootRedirect } from "@/components/RootRedirect";
import { IdleLogout } from "@/components/IdleLogout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Critical pages - load immediately (frequently used)
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Login from "./pages/Login";
import ClientDetail from "./pages/ClientDetail";
import Profile from "./pages/Profile";
import EmployeeProfile from "./pages/EmployeeProfile";
import ClientProfile from "./pages/ClientProfile";

// Lazy load less frequently used pages for code splitting
const Alerts = lazy(() => import("./pages/Alerts"));
const Activity = lazy(() => import("./pages/Activity"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Reports = lazy(() => import("./pages/Reports"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Settings = lazy(() => import("./pages/Settings"));
const TeamUtilizationForm = lazy(() => import("./pages/TeamUtilizationForm"));
const ClientFeedback = lazy(() => import("./pages/ClientFeedback"));
const Hiring = lazy(() => import("./pages/Hiring"));
const FeedbackAnalytics = lazy(() => import("./pages/FeedbackAnalytics"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const ClientOnboarding = lazy(() => import("./pages/ClientOnboarding"));
const EmployeePortal = lazy(() => import("./pages/EmployeePortal"));
const SmartClientPortal = lazy(() => import("./pages/SmartClientPortal"));
const WholesalerEmployeePortal = lazy(() => import("./pages/WholesalerEmployeePortal"));
const Portals = lazy(() => import("./pages/Portals"));
const EmployeeDetail = lazy(() => import("./pages/EmployeeDetail"));
const EmployeeAuth = lazy(() => import("./pages/EmployeeAuth"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const ClientAuth = lazy(() => import("./pages/ClientAuth"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const TodayWork = lazy(() => import("./pages/TodayWork"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Wrapper component for lazy routes with Suspense
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <IdleLogout />
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
                <LazyRoute><Portals /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><EmployeeDetail /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Alerts /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute userType="employee">
                <ErrorBoundary>
                  <LazyRoute><Activity /></LazyRoute>
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Opportunities /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Reports /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Referrals /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Settings /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute userType="any">
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-profile"
            element={
              <ProtectedRoute userType="employee">
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-profile"
            element={
              <ProtectedRoute userType="client">
                <ClientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute userType="any">
                <LazyRoute><ChangePassword /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/today-work"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><TodayWork /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-form"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><TeamUtilizationForm /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-feedback"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><ClientFeedback /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><Hiring /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback-analytics"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><FeedbackAnalytics /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><ClientPortal /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-onboarding"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><ClientOnboarding /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-portal"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><EmployeePortal /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-portal"
            element={
              <ProtectedRoute userType="client">
                <LazyRoute><SmartClientPortal /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesaler-portal"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><WholesalerEmployeePortal /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-auth"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><EmployeeAuth /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute userType="employee">
                <LazyRoute><EmployeeDashboard /></LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/client-auth" element={<LazyRoute><ClientAuth /></LazyRoute>} />
          <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
