import { useMemo, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { TeamUtilizationCard } from '@/components/dashboard/TeamUtilizationCard';
import { QuickDataUpload } from '@/components/dashboard/QuickDataUpload';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  mockActivities, 
  mockOpportunities,
  mockTeamLeads
} from '@/data/mockData';
import type { TeamLead } from '@/types';
import { 
  Users, 
  DollarSign, 
  Star, 
  Clock, 
  TrendingUp,
  Briefcase,
  UserPlus,
  BarChart3
} from 'lucide-react';

// Memoize formatCurrency function outside component to avoid recreation
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const Dashboard = () => {
  const { metrics, hiringMetrics } = useDashboardMetrics();
  const { employee, user: authUser, loading: authLoading } = useAuth();
  const [visibleTeamLeads, setVisibleTeamLeads] = useState<TeamLead[]>(mockTeamLeads);
  
  // Memoize welcome name calculation
  const welcomeName = useMemo(() => {
    if (authLoading) return '';
    return employee?.name || authUser?.email?.split('@')[0] || 'there';
  }, [authLoading, employee?.name, authUser?.email]);

  // Memoize net client change calculation
  const netClientChange = useMemo(
    () => metrics.clientsAddedThisMonth - metrics.clientsLostThisMonth,
    [metrics.clientsAddedThisMonth, metrics.clientsLostThisMonth]
  );

  // Memoize formatted values
  const formattedMRR = useMemo(() => formatCurrency(metrics.totalMRR), [metrics.totalMRR]);
  const formattedQuarterlyRevenue = useMemo(() => formatCurrency(metrics.quarterlyRevenue), [metrics.quarterlyRevenue]);
  const formattedOpportunitiesPotential = useMemo(() => formatCurrency(metrics.opportunitiesPotential), [metrics.opportunitiesPotential]);

  // Determine which teams to show based on role
  useEffect(() => {
    const resolveTeamLeads = async () => {
      // No employee record yet – fallback to all teams
      if (!employee) {
        setVisibleTeamLeads(mockTeamLeads);
        return;
      }

      const userEmail = authUser?.email || employee.email || '';
      const isCEO = employee.role === 'CEO' && userEmail === 'junaid@amzdudes.com';

      // Admin / CEO: show all teams
      if (isCEO) {
        setVisibleTeamLeads(mockTeamLeads);
        return;
      }

      // Regular employee: show only their own team (via team_lead_id)
      if (!employee.team_lead_id) {
        setVisibleTeamLeads([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('team_leads')
          .select('name, email, department')
          .eq('id', employee.team_lead_id)
          .maybeSingle();

        if (error || !data) {
          console.error('Error fetching team lead for employee:', error);
          setVisibleTeamLeads([]);
          return;
        }

        // Try to match the real team lead record to our mockTeamLeads by email/name/department
        const match = mockTeamLeads.find(
          (lead) =>
            lead.email === data.email ||
            lead.name === data.name ||
            lead.department === data.department
        );

        setVisibleTeamLeads(match ? [match] : []);
      } catch (err) {
        console.error('Error resolving employee team lead:', err);
        setVisibleTeamLeads([]);
      }
    };

    if (!authLoading) {
      resolveTeamLeads();
    }
  }, [employee, authUser, authLoading]);

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={welcomeName ? `Welcome back, ${welcomeName}. Here's what's happening with your agency.` : "Welcome back. Here's what's happening with your agency."}
    >
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Clients"
          value={metrics.totalClients}
          change={{ 
            value: `${netClientChange >= 0 ? '+' : ''}${netClientChange} this month`, 
            positive: netClientChange >= 0 
          }}
          icon={Users}
          variant="primary"
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={formattedMRR}
          change={{ 
            value: `${metrics.mrrChange >= 0 ? '+' : ''}${metrics.mrrChange}% vs last month`, 
            positive: metrics.mrrChange >= 0 
          }}
          icon={DollarSign}
          variant="success"
        />
        <MetricCard
          title="Avg Client Score"
          value={`${metrics.avgClientScore}/10`}
          change={{ value: 'From client feedback', positive: metrics.avgClientScore >= 7 }}
          icon={Star}
          variant={metrics.avgClientScore >= 8 ? 'success' : metrics.avgClientScore >= 6 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Attendance Score"
          value={`${metrics.attendanceScore}%`}
          change={{ value: 'Yesterday', positive: metrics.attendanceScore >= 90 }}
          icon={Clock}
          variant={metrics.attendanceScore >= 90 ? 'success' : metrics.attendanceScore >= 75 ? 'warning' : 'danger'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={`${metrics.currentQuarter} Revenue`}
          value={formattedQuarterlyRevenue}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Opportunities Pipeline"
          value={metrics.opportunitiesPipeline}
          change={{ value: formattedOpportunitiesPotential + ' potential', positive: true }}
          icon={Briefcase}
        />
        <MetricCard
          title="Team Utilization"
          value={`${metrics.teamUtilization}%`}
          icon={BarChart3}
          variant={metrics.teamUtilization >= 80 ? 'success' : metrics.teamUtilization >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Hiring & Interviews"
          value={hiringMetrics.newHiresThisMonth}
          change={{ value: `${hiringMetrics.interviewsScheduled} scheduled, ${hiringMetrics.jobPostsActive} posts`, positive: true }}
          icon={UserPlus}
        />
      </div>

      {/* Main Content - Single Column */}
      <div className="space-y-8">
        {/* Quick Data Upload */}
        <QuickDataUpload />

        {/* Team Utilization */}
        <TeamUtilizationCard teamLeads={visibleTeamLeads.length > 0 ? visibleTeamLeads : mockTeamLeads} />

        {/* Activity Feed */}
        <ActivityFeed activities={mockActivities} />

        {/* Growth Opportunities */}
        <OpportunityCards opportunities={mockOpportunities} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
