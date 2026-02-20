import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { LogActivityDialog } from '@/components/dashboard/LogActivityDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, Loader2 } from 'lucide-react';
import { useActivityLog } from '@/hooks/useActivityLog';
import type { Activity } from '@/types';

const Activity = () => {
  const { activities: logEntries, loading, fetchError, addActivity, refetch } = useActivityLog();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  const safeLogEntries = Array.isArray(logEntries) ? logEntries : [];

  const activities: Activity[] = useMemo(
    () =>
      safeLogEntries
        .filter((e) => {
          const title = e?.title ?? '';
          const desc = e?.description ?? '';
          const by = e?.performed_by ?? '';
          const matchSearch =
            !search ||
            title.toLowerCase().includes(search.toLowerCase()) ||
            desc.toLowerCase().includes(search.toLowerCase());
          const matchType = typeFilter === 'all' || e.type === typeFilter;
          const matchTeam = teamFilter === 'all' || by.toLowerCase().includes(teamFilter.toLowerCase());
          return matchSearch && matchType && matchTeam;
        })
        .map((e) => ({
          id: e.id,
          clientId: e.client_id ?? '',
          type: e.type ?? 'optimization',
          title: e?.title ?? '',
          description: e?.description ?? '',
          impact: e?.impact ?? undefined,
          timestamp: e?.created_at ?? new Date().toISOString(),
          performedBy: e?.performed_by ?? '',
        })),
    [safeLogEntries, search, typeFilter, teamFilter]
  );

  const teamMembers = useMemo(
    () => Array.from(new Set(safeLogEntries.map((e) => (e?.performed_by ?? '').trim()).filter(Boolean))).sort(),
    [safeLogEntries]
  );

  return (
    <AppLayout title="Activity Feed" subtitle="Track all actions taken across client accounts">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="optimization">Optimization</SelectItem>
            <SelectItem value="listing">Listing</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
            <SelectItem value="alert_response">Alert response</SelectItem>
            <SelectItem value="report">Report</SelectItem>
          </SelectContent>
        </Select>

        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Team Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team</SelectItem>
            {teamMembers.map((name) => (
              <SelectItem key={name} value={name.toLowerCase()}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Date Range
        </Button>

        <LogActivityDialog addActivity={addActivity} onLogged={refetch} />
      </div>

      {/* Activity Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {fetchError && (
            <p className="text-sm text-muted-foreground mb-4 rounded-lg border border-border bg-muted/50 p-4">
              Activity log could not be loaded. If you have not run the Supabase migration yet, create the{' '}
              <code className="text-xs bg-muted px-1 rounded">activity_log</code> table (see{' '}
              <code className="text-xs bg-muted px-1 rounded">supabase/migrations/20260220000000_activity_log.sql</code>).
            </p>
          )}
          <ActivityFeed activities={activities} title="All Activities" />
        </>
      )}
    </AppLayout>
  );
};

export default Activity;
