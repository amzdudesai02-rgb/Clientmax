// ClientMax Pro Types

export type ClientType = 'brand_owner' | 'reseller' | 'wholesaler' | 'product_launcher' | '3p_seller';

export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical';

export type AlertSeverity = 'critical' | 'warning' | 'opportunity';

export type AlertStatus = 'active' | 'acknowledged' | 'in_progress' | 'resolved' | 'snoozed';

export type UserRole = 'owner' | 'manager' | 'specialist' | 'client';

export interface Client {
  id: string;
  name: string;
  companyName: string;
  type: ClientType;
  healthScore: number;
  healthStatus: HealthStatus;
  revenue30Days: number;
  adSpend30Days: number;
  roas: number;
  assignedManager: string;
  package: string;
  mrr: number;
  lastContactDate: string;
  alertsActive: number;
  activeSince: string;
}

export interface Alert {
  id: string;
  clientId: string;
  clientName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  createdAt: string;
  actionRequired: string;
  estimatedImpact?: string;
}

export interface Activity {
  id: string;
  clientId: string;
  type: 'optimization' | 'listing' | 'strategy' | 'alert_response' | 'report';
  title: string;
  description: string;
  impact?: string;
  timestamp: string;
  performedBy: string;
}

export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  type: 'quick_win' | 'medium_play' | 'big_opportunity';
  title: string;
  description: string;
  potentialRevenue: number;
  investment: string;
  timeline: string;
  status: 'identified' | 'pitched' | 'accepted' | 'declined' | 'deferred';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  activeClients: number;
}

export interface DashboardMetrics {
  totalClients: number;
  clientsAddedThisMonth: number;
  clientsLostThisMonth: number;
  totalMRR: number;
  mrrChange: number;
  avgClientScore: number;
  attendanceScore: number;
  quarterlyRevenue: number;
  currentQuarter: string;
  opportunitiesPipeline: number;
  opportunitiesPotential: number;
  teamUtilization: number;
}

export interface TeamLead {
  id: string;
  name: string;
  department: string;
  email: string;
  teamSize: number;
  utilization: number;
  lastUpdated: string;
}

export interface TeamUtilizationSubmission {
  teamLeadId: string;
  teamLeadName: string;
  department: string;
  utilization: number;
  performanceNotes?: string;
  submittedAt: string;
}

// Hiring Types
export type JobPostStatus = 'active' | 'paused' | 'closed' | 'draft';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type HireStatus = 'onboarding' | 'probation' | 'active' | 'terminated';

export interface JobPost {
  id: string;
  title: string;
  department: string;
  status: JobPostStatus;
  applicants: number;
  createdAt: string;
  closingDate?: string;
}

export interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobPostId: string;
  jobTitle: string;
  status: InterviewStatus;
  scheduledAt: string;
  interviewerName: string;
  notes?: string;
}

export interface NewHire {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  startDate: string;
  status: HireStatus;
  manager: string;
}

export interface HiringMetrics {
  jobPostsActive: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  newHiresThisMonth: number;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  score: number;
  feedback?: string;
  submittedAt: string;
}

// Notification System Types
export type NotificationType = 'alert' | 'update' | 'system' | 'success' | 'feedback_alert' | 'utilization_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  alertId?: string;
  clientId?: string;
  clientName?: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  criticalOnly: boolean;
  feedbackThreshold: number;
  utilizationThreshold: number;
}

// Report System Types
export type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'custom';

export type ReportStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  isDefault: boolean;
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'metrics' | 'chart' | 'table' | 'text' | 'alerts' | 'opportunities';
  enabled: boolean;
  order: number;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  clientId: string;
  clientName: string;
  status: ReportStatus;
  templateId: string;
  createdAt: string;
  sentDate?: string;
  scheduledDate?: string;
  emailRecipients: string[];
  pdfUrl?: string;
}

export interface ReportSchedule {
  id: string;
  clientId: string;
  clientName: string;
  templateId: string;
  frequency: ReportType;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  emailRecipients: string[];
  enabled: boolean;
  nextRunDate: string;
}

// Performance Data Types
export interface PerformanceDataPoint {
  date: string;
  revenue: number;
  adSpend: number;
  orders: number;
  sessions: number;
  conversions: number;
}

export interface ClientPerformance {
  clientId: string;
  data: PerformanceDataPoint[];
}

// Client Portal Types
export interface ClientPortalMessage {
  id: string;
  clientId: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'manager';
  message: string;
  timestamp: string;
  read: boolean;
}
