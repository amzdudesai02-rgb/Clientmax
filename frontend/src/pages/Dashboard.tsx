import { useMemo, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { TeamUtilizationCard } from '@/components/dashboard/TeamUtilizationCard';
import { QuickDataUpload } from '@/components/dashboard/QuickDataUpload';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useAuth } from '@/hooks/useAuth';
import { useTeamLeads } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
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
  // Teams: Admin sees all (from DB), Employee sees only their team (from DB)
  const { teamLeads: dbTeamLeads } = useTeamLeads();
  const [visibleTeamLeads, setVisibleTeamLeads] = useState<TeamLead[]>([]);

  // Map DB team_leads to TeamLead type (utilization/teamSize from DB or 0)
  const dbTeamLeadsAsTeamLead: TeamLead[] = useMemo(
    () =>
      dbTeamLeads.map((tl) => ({
        id: tl.id,
        name: tl.name,
        email: tl.email,
        department: tl.department,
        teamSize: 0,
        utilization: 0,
        lastUpdated: '',
      })),
    [dbTeamLeads]
  );

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

  // Admin = CEO with junaid@amzdudes.com (sees all metrics + all teams). Employee = restricted metrics + own team only.
  const isAdmin = useMemo(() => {
    if (authLoading || !employee) return false;
    const userEmail = authUser?.email || employee.email || '';
    return employee.role === 'CEO' && userEmail === 'junaid@amzdudes.com';
  }, [authLoading, employee, authUser?.email]);

  // Determine which teams to show: Admin = all from DB, Employee = only their team
  useEffect(() => {
    if (authLoading || !employee) {
      setVisibleTeamLeads([]);
      return;
    }

    const userEmail = authUser?.email || employee.email || '';
    const admin = employee.role === 'CEO' && userEmail === 'junaid@amzdudes.com';

    if (admin) {
      setVisibleTeamLeads(dbTeamLeadsAsTeamLead);
      return;
    }

    // Employee: only their team (by team_lead_id)
    if (!employee.team_lead_id) {
      setVisibleTeamLeads([]);
      return;
    }

    const myTeam = dbTeamLeadsAsTeamLead.find((tl) => tl.id === employee.team_lead_id);
    setVisibleTeamLeads(myTeam ? [myTeam] : []);
  }, [employee, authUser, authLoading, dbTeamLeadsAsTeamLead]);

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={welcomeName ? `Welcome back, ${welcomeName}. Here's what's happening with your agency.` : "Welcome back. Here's what's happening with your agency."}
    >
      {/* Primary Metrics Grid — Admin sees all 4; Employee sees only Attendance Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin && (
          <>
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
          </>
        )}
        <MetricCard
          title="Attendance Score"
          value={`${metrics.attendanceScore}%`}
          change={{ value: 'Yesterday', positive: metrics.attendanceScore >= 90 }}
          icon={Clock}
          variant={metrics.attendanceScore >= 90 ? 'success' : metrics.attendanceScore >= 75 ? 'warning' : 'danger'}
        />
      </div>

      {/* Secondary Metrics — Admin sees Q1 Revenue + 3; Employee sees only 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin && (
          <MetricCard
            title={`${metrics.currentQuarter} Revenue`}
            value={formattedQuarterlyRevenue}
            icon={TrendingUp}
            variant="success"
          />
        )}
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
        <TeamUtilizationCard teamLeads={visibleTeamLeads} />

        {/* Activity Feed - real data only, no demo */}
        <ActivityFeed activities={[]} />

        {/* Growth Opportunities - real data only, no demo */}
        <OpportunityCards opportunities={[]} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
