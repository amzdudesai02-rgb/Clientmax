import { 
  Client, 
  Alert, 
  Activity, 
  Opportunity, 
  TeamMember, 
  DashboardMetrics,
  TeamLead,
  HiringMetrics,
  JobPost,
  Interview,
  NewHire,
  ClientFeedback,
  Notification,
  ReportTemplate,
  Report,
  ReportSchedule,
  PerformanceDataPoint 
} from '@/types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    companyName: 'NaturaCare Supplements',
    type: 'brand_owner',
    healthScore: 92,
    healthStatus: 'excellent',
    revenue30Days: 48500,
    adSpend30Days: 12000,
    roas: 4.04,
    assignedManager: 'Alex Thompson',
    package: 'Growth',
    mrr: 2500,
    lastContactDate: '2026-01-14',
    alertsActive: 0,
    activeSince: '2025-03-15'
  },
  {
    id: '2',
    name: 'Michael Chen',
    companyName: 'TechGear Pro',
    type: 'brand_owner',
    healthScore: 78,
    healthStatus: 'good',
    revenue30Days: 32000,
    adSpend30Days: 9500,
    roas: 3.37,
    assignedManager: 'Alex Thompson',
    package: 'Starter',
    mrr: 1500,
    lastContactDate: '2026-01-12',
    alertsActive: 2,
    activeSince: '2025-06-01'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    companyName: 'HomeStyle Living',
    type: 'brand_owner',
    healthScore: 65,
    healthStatus: 'warning',
    revenue30Days: 18500,
    adSpend30Days: 6800,
    roas: 2.72,
    assignedManager: 'Jordan Martinez',
    package: 'Starter',
    mrr: 1500,
    lastContactDate: '2026-01-10',
    alertsActive: 3,
    activeSince: '2025-08-22'
  },
  {
    id: '4',
    name: 'David Kim',
    companyName: 'Seoul Snacks Co',
    type: 'product_launcher',
    healthScore: 88,
    healthStatus: 'excellent',
    revenue30Days: 15200,
    adSpend30Days: 4500,
    roas: 3.38,
    assignedManager: 'Casey Williams',
    package: 'Launch + Grow',
    mrr: 1500,
    lastContactDate: '2026-01-15',
    alertsActive: 0,
    activeSince: '2025-11-10'
  },
  {
    id: '5',
    name: 'Rachel Green',
    companyName: 'FastShip Wholesale',
    type: 'wholesaler',
    healthScore: 45,
    healthStatus: 'critical',
    revenue30Days: 125000,
    adSpend30Days: 2200,
    roas: 2.1,
    assignedManager: 'Jordan Martinez',
    package: 'Volume Pro',
    mrr: 800,
    lastContactDate: '2026-01-08',
    alertsActive: 5,
    activeSince: '2024-12-01'
  },
  {
    id: '6',
    name: 'Tom Bradley',
    companyName: 'Outdoor Adventures',
    type: '3p_seller',
    healthScore: 71,
    healthStatus: 'good',
    revenue30Days: 22800,
    adSpend30Days: 5600,
    roas: 4.07,
    assignedManager: 'Alex Thompson',
    package: 'Essential',
    mrr: 1000,
    lastContactDate: '2026-01-13',
    alertsActive: 1,
    activeSince: '2025-04-18'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    clientId: '5',
    clientName: 'FastShip Wholesale',
    severity: 'critical',
    status: 'active',
    title: 'Listing Suppressed - ASIN B08XYZ123',
    description: 'Main product listing has been suppressed due to image policy violation',
    createdAt: '2026-01-16T08:30:00Z',
    actionRequired: 'Review and update main image to comply with Amazon guidelines',
    estimatedImpact: '$4,200/day in lost sales'
  },
  {
    id: 'a2',
    clientId: '3',
    clientName: 'HomeStyle Living',
    severity: 'critical',
    status: 'active',
    title: 'Inventory Critical - 3 SKUs below 7 days',
    description: 'Three top-selling SKUs will stock out within 7 days at current velocity',
    createdAt: '2026-01-16T06:15:00Z',
    actionRequired: 'Confirm restock dates with client or pause advertising',
    estimatedImpact: '$8,500 in potential lost revenue'
  },
  {
    id: 'a3',
    clientId: '2',
    clientName: 'TechGear Pro',
    severity: 'warning',
    status: 'acknowledged',
    title: 'Buy Box Lost on Primary ASIN',
    description: 'Competitor undercut price by 12%, Buy Box percentage dropped to 34%',
    createdAt: '2026-01-15T14:22:00Z',
    actionRequired: 'Review pricing strategy or enable repricer automation',
    estimatedImpact: '$1,800/day revenue impact'
  },
  {
    id: 'a4',
    clientId: '5',
    clientName: 'FastShip Wholesale',
    severity: 'warning',
    status: 'active',
    title: 'Ad Budget Maxing Out Daily',
    description: 'Campaign budget hitting cap by 2 PM for last 5 consecutive days',
    createdAt: '2026-01-14T16:00:00Z',
    actionRequired: 'Increase daily budget or optimize bids to extend coverage',
  },
  {
    id: 'a5',
    clientId: '6',
    clientName: 'Outdoor Adventures',
    severity: 'opportunity',
    status: 'active',
    title: 'Competitor Out of Stock - Category Leader',
    description: 'Main competitor "TrailMaster" is out of stock on top 3 ASINs',
    createdAt: '2026-01-16T10:00:00Z',
    actionRequired: 'Increase ad spend on competing keywords to capture market share',
    estimatedImpact: '+$3,200 in additional revenue opportunity'
  },
  {
    id: 'a6',
    clientId: '2',
    clientName: 'TechGear Pro',
    severity: 'opportunity',
    status: 'active',
    title: 'High-Converting Keywords Available',
    description: '5 keywords with 18%+ conversion rate available under $0.85 CPC',
    createdAt: '2026-01-15T11:30:00Z',
    actionRequired: 'Add keywords to exact match campaign',
    estimatedImpact: '+$2,100/month revenue potential'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'act1',
    clientId: '1',
    type: 'optimization',
    title: 'Optimized 3 underperforming campaigns',
    description: 'Paused low-converting keywords and reallocated budget to top performers',
    impact: 'Reduced wasted spend by $43/day',
    timestamp: '2026-01-16T14:47:00Z',
    performedBy: 'Alex Thompson'
  },
  {
    id: 'act2',
    clientId: '1',
    type: 'optimization',
    title: 'Added 23 negative keywords',
    description: 'Search term analysis revealed irrelevant traffic sources',
    impact: 'Improved CTR from 0.8% to 1.2%',
    timestamp: '2026-01-16T11:22:00Z',
    performedBy: 'Alex Thompson'
  },
  {
    id: 'act3',
    clientId: '4',
    type: 'listing',
    title: 'Completed A+ content refresh',
    description: 'Updated A+ content for top 3 products with new lifestyle imagery',
    impact: 'Estimated 8-12% conversion rate increase',
    timestamp: '2026-01-15T16:30:00Z',
    performedBy: 'Casey Williams'
  },
  {
    id: 'act4',
    clientId: '3',
    type: 'alert_response',
    title: 'Detected competitor price drop',
    description: 'Competitor dropped price on ASIN B08XYZ by 15%',
    impact: 'Adjusted pricing within 2 hours',
    timestamp: '2026-01-15T09:15:00Z',
    performedBy: 'Jordan Martinez'
  },
  {
    id: 'act5',
    clientId: '2',
    type: 'strategy',
    title: 'Monthly strategy call completed',
    description: 'Reviewed Q4 performance and set Q1 goals',
    timestamp: '2026-01-14T10:00:00Z',
    performedBy: 'Alex Thompson'
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp1',
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    type: 'quick_win',
    title: 'Subscribe & Save Enrollment',
    description: 'Top 3 products not enrolled in Subscribe & Save. Competitors show 15-20% of sales from S&S.',
    potentialRevenue: 2800,
    investment: '$500/month setup + management',
    timeline: '2 weeks to launch',
    status: 'pitched'
  },
  {
    id: 'opp2',
    clientId: '2',
    clientName: 'TechGear Pro',
    type: 'medium_play',
    title: 'Sponsored Display Retargeting',
    description: 'Not running Sponsored Display retargeting ads. Similar clients see 8-12% incremental revenue.',
    potentialRevenue: 6200,
    investment: '$800/month + 10% of attributed revenue',
    timeline: '1 month to optimize',
    status: 'identified'
  },
  {
    id: 'opp3',
    clientId: '3',
    clientName: 'HomeStyle Living',
    type: 'big_opportunity',
    title: 'Listing Conversion Optimization',
    description: 'Brand traffic up 40% but conversion rate is 3.2% vs industry avg 5.1%. Fixing listings could add significant revenue.',
    potentialRevenue: 18000,
    investment: '$2,000 one-time + $1,200/month ongoing',
    timeline: '6 weeks to full rollout',
    status: 'identified'
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'Alex Thompson',
    email: 'alex@agency.com',
    role: 'manager',
    activeClients: 12
  },
  {
    id: 't2',
    name: 'Jordan Martinez',
    email: 'jordan@agency.com',
    role: 'manager',
    activeClients: 10
  },
  {
    id: 't3',
    name: 'Casey Williams',
    email: 'casey@agency.com',
    role: 'specialist',
    activeClients: 8
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalClients: 35,
  clientsAddedThisMonth: 5,
  clientsLostThisMonth: 2,
  totalMRR: 56100,
  mrrChange: 12,
  avgClientScore: 8.4,
  attendanceScore: 94,
  quarterlyRevenue: 892000,
  currentQuarter: 'Q1 2026',
  opportunitiesPipeline: 42,
  opportunitiesPotential: 127000,
  teamUtilization: 83
};

export const mockTeamLeads: TeamLead[] = [
  {
    id: 'tl1',
    name: 'Asad',
    department: 'Brand Management',
    email: 'asad@amzdudes.com',
    teamSize: 5,
    utilization: 85,
    lastUpdated: '2026-01-18'
  },
  {
    id: 'tl2',
    name: 'Munaam',
    department: 'Account Management',
    email: 'munaam@amzdudes.com',
    teamSize: 4,
    utilization: 78,
    lastUpdated: '2026-01-18'
  },
  {
    id: 'tl3',
    name: 'SHK',
    department: 'Operations',
    email: 'shk@amzdudes.com',
    teamSize: 6,
    utilization: 92,
    lastUpdated: '2026-01-17'
  },
  {
    id: 'tl4',
    name: 'Aqib',
    department: 'Walmart & TikTok',
    email: 'aqib@amzdudes.com',
    teamSize: 4,
    utilization: 70,
    lastUpdated: '2026-01-18'
  },
  {
    id: 'tl5',
    name: 'Osama',
    department: 'Wholesale Team',
    email: 'osama@amzdudes.com',
    teamSize: 3,
    utilization: 88,
    lastUpdated: '2026-01-16'
  },
  {
    id: 'tl6',
    name: 'Junaid',
    department: 'Sales',
    email: 'junaid@amzdudes.com',
    teamSize: 4,
    utilization: 76,
    lastUpdated: '2026-01-18'
  }
];

export const mockHiringMetrics: HiringMetrics = {
  jobPostsActive: 4,
  interviewsScheduled: 6,
  interviewsCompleted: 12,
  newHiresThisMonth: 2
};

export const mockJobPosts: JobPost[] = [
  {
    id: 'jp1',
    title: 'Amazon PPC Specialist',
    department: 'Account Management',
    status: 'active',
    applicants: 23,
    createdAt: '2026-01-10',
    closingDate: '2026-02-10'
  },
  {
    id: 'jp2',
    title: 'Brand Manager',
    department: 'Brand Management',
    status: 'active',
    applicants: 15,
    createdAt: '2026-01-12'
  },
  {
    id: 'jp3',
    title: 'Wholesale Coordinator',
    department: 'Wholesale Team',
    status: 'active',
    applicants: 8,
    createdAt: '2026-01-15'
  },
  {
    id: 'jp4',
    title: 'Operations Assistant',
    department: 'Operations',
    status: 'paused',
    applicants: 31,
    createdAt: '2026-01-05'
  }
];

export const mockInterviews: Interview[] = [
  {
    id: 'int1',
    candidateName: 'Ahmed Khan',
    candidateEmail: 'ahmed.khan@email.com',
    jobPostId: 'jp1',
    jobTitle: 'Amazon PPC Specialist',
    status: 'scheduled',
    scheduledAt: '2026-01-20T10:00:00',
    interviewerName: 'Munaam'
  },
  {
    id: 'int2',
    candidateName: 'Sara Ali',
    candidateEmail: 'sara.ali@email.com',
    jobPostId: 'jp2',
    jobTitle: 'Brand Manager',
    status: 'scheduled',
    scheduledAt: '2026-01-20T14:00:00',
    interviewerName: 'Asad'
  },
  {
    id: 'int3',
    candidateName: 'Bilal Hassan',
    candidateEmail: 'bilal.h@email.com',
    jobPostId: 'jp1',
    jobTitle: 'Amazon PPC Specialist',
    status: 'completed',
    scheduledAt: '2026-01-18T11:00:00',
    interviewerName: 'Munaam',
    notes: 'Strong candidate, good PPC experience'
  }
];

export const mockNewHires: NewHire[] = [
  {
    id: 'nh1',
    name: 'Fatima Zahra',
    email: 'fatima@amzdudes.com',
    position: 'Account Executive',
    department: 'Account Management',
    startDate: '2026-01-15',
    status: 'onboarding',
    manager: 'Munaam'
  },
  {
    id: 'nh2',
    name: 'Usman Malik',
    email: 'usman@amzdudes.com',
    position: 'TikTok Specialist',
    department: 'Wholesale & TikTok',
    startDate: '2026-01-08',
    status: 'probation',
    manager: 'Aqib'
  }
];

export const mockClientFeedback: ClientFeedback[] = [
  {
    id: 'cf1',
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    score: 9,
    feedback: 'Excellent service, very responsive team',
    submittedAt: '2026-01-15'
  },
  {
    id: 'cf2',
    clientId: '2',
    clientName: 'TechGear Pro',
    score: 8,
    feedback: 'Great results on PPC campaigns',
    submittedAt: '2026-01-14'
  },
  {
    id: 'cf3',
    clientId: '3',
    clientName: 'HomeStyle Living',
    score: 7,
    feedback: 'Good support but could improve communication',
    submittedAt: '2026-01-12'
  },
  {
    id: 'cf4',
    clientId: '4',
    clientName: 'Seoul Snacks Co',
    score: 10,
    feedback: 'Amazing work on our product launch!',
    submittedAt: '2026-01-10'
  },
  {
    id: 'cf5',
    clientId: '5',
    clientName: 'FastShip Wholesale',
    score: 6,
    feedback: 'Some delays in response time',
    submittedAt: '2026-01-08'
  },
  {
    id: 'cf6',
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    score: 9,
    feedback: 'Consistently excellent',
    submittedAt: '2025-12-15'
  },
  {
    id: 'cf7',
    clientId: '2',
    clientName: 'TechGear Pro',
    score: 8,
    feedback: 'Very pleased with Q4 results',
    submittedAt: '2025-12-10'
  },
  {
    id: 'cf8',
    clientId: '6',
    clientName: 'Outdoor Adventures',
    score: 9,
    feedback: 'Great team to work with',
    submittedAt: '2025-12-05'
  }
];

// Notification Mock Data
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'alert',
    title: 'Critical Alert',
    message: 'Listing Suppressed - ASIN B08XYZ123 for FastShip Wholesale',
    timestamp: '2026-01-16T08:30:00Z',
    read: false,
    alertId: 'a1',
    clientId: '5',
    clientName: 'FastShip Wholesale',
    priority: 'high',
    actionUrl: '/clients/5'
  },
  {
    id: 'n2',
    type: 'alert',
    title: 'Inventory Warning',
    message: '3 SKUs below 7 days for HomeStyle Living',
    timestamp: '2026-01-16T06:15:00Z',
    read: false,
    alertId: 'a2',
    clientId: '3',
    clientName: 'HomeStyle Living',
    priority: 'high',
    actionUrl: '/clients/3'
  },
  {
    id: 'n3',
    type: 'success',
    title: 'Report Sent',
    message: 'Weekly Snapshot for NaturaCare Supplements has been delivered',
    timestamp: '2026-01-15T09:00:00Z',
    read: true,
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    priority: 'low'
  },
  {
    id: 'n4',
    type: 'update',
    title: 'Opportunity Identified',
    message: 'Competitor Out of Stock - potential revenue opportunity for Outdoor Adventures',
    timestamp: '2026-01-16T10:00:00Z',
    read: false,
    clientId: '6',
    clientName: 'Outdoor Adventures',
    priority: 'medium',
    actionUrl: '/opportunities'
  },
  {
    id: 'n5',
    type: 'system',
    title: 'System Update',
    message: 'New report templates are now available',
    timestamp: '2026-01-14T15:00:00Z',
    read: true,
    priority: 'low'
  }
];

// Report Templates
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'tpl1',
    name: 'Weekly Snapshot',
    description: 'Quick weekly overview with key metrics and alerts',
    isDefault: true,
    sections: [
      { id: 's1', name: 'Executive Summary', type: 'text', enabled: true, order: 1 },
      { id: 's2', name: 'Key Metrics', type: 'metrics', enabled: true, order: 2 },
      { id: 's3', name: 'Revenue Chart', type: 'chart', enabled: true, order: 3 },
      { id: 's4', name: 'Active Alerts', type: 'alerts', enabled: true, order: 4 },
      { id: 's5', name: 'Actions Taken', type: 'table', enabled: true, order: 5 }
    ]
  },
  {
    id: 'tpl2',
    name: 'Monthly Business Review',
    description: 'Comprehensive monthly report with detailed analytics',
    isDefault: false,
    sections: [
      { id: 's1', name: 'Executive Summary', type: 'text', enabled: true, order: 1 },
      { id: 's2', name: 'Key Performance Indicators', type: 'metrics', enabled: true, order: 2 },
      { id: 's3', name: 'Revenue Trends', type: 'chart', enabled: true, order: 3 },
      { id: 's4', name: 'Advertising Performance', type: 'chart', enabled: true, order: 4 },
      { id: 's5', name: 'Alerts & Resolutions', type: 'alerts', enabled: true, order: 5 },
      { id: 's6', name: 'Opportunities Pipeline', type: 'opportunities', enabled: true, order: 6 },
      { id: 's7', name: 'Activity Log', type: 'table', enabled: true, order: 7 },
      { id: 's8', name: 'Next Month Goals', type: 'text', enabled: true, order: 8 }
    ]
  },
  {
    id: 'tpl3',
    name: 'Quarterly Strategic Review',
    description: 'Strategic quarterly report for executive stakeholders',
    isDefault: false,
    sections: [
      { id: 's1', name: 'Quarter Overview', type: 'text', enabled: true, order: 1 },
      { id: 's2', name: 'Performance Summary', type: 'metrics', enabled: true, order: 2 },
      { id: 's3', name: 'Revenue Analysis', type: 'chart', enabled: true, order: 3 },
      { id: 's4', name: 'YoY Comparison', type: 'chart', enabled: true, order: 4 },
      { id: 's5', name: 'Strategic Opportunities', type: 'opportunities', enabled: true, order: 5 },
      { id: 's6', name: 'Competitive Analysis', type: 'table', enabled: true, order: 6 },
      { id: 's7', name: 'Action Items', type: 'table', enabled: true, order: 7 },
      { id: 's8', name: 'Next Quarter Strategy', type: 'text', enabled: true, order: 8 }
    ]
  }
];

// Report Mock Data
export const mockReports: Report[] = [
  {
    id: 'r1',
    name: 'Weekly Snapshot - NaturaCare Supplements',
    type: 'weekly',
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    status: 'sent',
    templateId: 'tpl1',
    createdAt: '2026-01-10T08:00:00Z',
    sentDate: '2026-01-10T09:00:00Z',
    emailRecipients: ['sarah@naturacare.com']
  },
  {
    id: 'r2',
    name: 'Monthly Business Review - January 2026',
    type: 'monthly',
    clientId: '2',
    clientName: 'TechGear Pro',
    status: 'scheduled',
    templateId: 'tpl2',
    createdAt: '2026-01-15T10:00:00Z',
    scheduledDate: '2026-02-01T09:00:00Z',
    emailRecipients: ['michael@techgearpro.com', 'team@techgearpro.com']
  },
  {
    id: 'r3',
    name: 'Weekly Snapshot - HomeStyle Living',
    type: 'weekly',
    clientId: '3',
    clientName: 'HomeStyle Living',
    status: 'draft',
    templateId: 'tpl1',
    createdAt: '2026-01-16T14:00:00Z',
    emailRecipients: ['emma@homestyleliving.com']
  },
  {
    id: 'r4',
    name: 'Quarterly Strategic Review - Q4 2025',
    type: 'quarterly',
    clientId: '4',
    clientName: 'Seoul Snacks Co',
    status: 'sent',
    templateId: 'tpl3',
    createdAt: '2026-01-05T08:00:00Z',
    sentDate: '2026-01-05T10:00:00Z',
    emailRecipients: ['david@seoulsnacks.com']
  }
];

// Report Schedules
export const mockReportSchedules: ReportSchedule[] = [
  {
    id: 'rs1',
    clientId: '1',
    clientName: 'NaturaCare Supplements',
    templateId: 'tpl1',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    time: '09:00',
    emailRecipients: ['sarah@naturacare.com'],
    enabled: true,
    nextRunDate: '2026-01-20T09:00:00Z'
  },
  {
    id: 'rs2',
    clientId: '2',
    clientName: 'TechGear Pro',
    templateId: 'tpl2',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '09:00',
    emailRecipients: ['michael@techgearpro.com'],
    enabled: true,
    nextRunDate: '2026-02-01T09:00:00Z'
  },
  {
    id: 'rs3',
    clientId: '4',
    clientName: 'Seoul Snacks Co',
    templateId: 'tpl3',
    frequency: 'quarterly',
    dayOfMonth: 1,
    time: '10:00',
    emailRecipients: ['david@seoulsnacks.com'],
    enabled: true,
    nextRunDate: '2026-04-01T10:00:00Z'
  }
];

// Performance Data Generator
export const generatePerformanceData = (clientId: string): PerformanceDataPoint[] => {
  const data: PerformanceDataPoint[] = [];
  const baseRevenue = mockClients.find(c => c.id === clientId)?.revenue30Days || 20000;
  const baseAdSpend = mockClients.find(c => c.id === clientId)?.adSpend30Days || 5000;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120% variance
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round((baseRevenue / 30) * variance),
      adSpend: Math.round((baseAdSpend / 30) * variance),
      orders: Math.round(15 * variance),
      sessions: Math.round(500 * variance),
      conversions: Math.round(25 * variance)
    });
  }
  
  return data;
};
