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
  const { activities: logEntries, loading, addActivity, refetch } = useActivityLog();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  const activities: Activity[] = useMemo(
    () =>
      logEntries
        .filter((e) => {
          const matchSearch =
            !search ||
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.description.toLowerCase().includes(search.toLowerCase());
          const matchType = typeFilter === 'all' || e.type === typeFilter;
          const matchTeam = teamFilter === 'all' || e.performed_by.toLowerCase().includes(teamFilter.toLowerCase());
          return matchSearch && matchType && matchTeam;
        })
        .map((e) => ({
          id: e.id,
          clientId: e.client_id ?? '',
          type: e.type,
          title: e.title,
          description: e.description,
          impact: e.impact ?? undefined,
          timestamp: e.created_at,
          performedBy: e.performed_by,
        })),
    [logEntries, search, typeFilter, teamFilter]
  );

  const teamMembers = useMemo(() => Array.from(new Set(logEntries.map((e) => e.performed_by))).sort(), [logEntries]);

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
        <ActivityFeed activities={activities} title="All Activities" />
      )}
    </AppLayout>
  );
};

export default Activity;
