import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { toast } from '@/hooks/use-toast';
import type { ActivityLogEntry } from '@/hooks/useActivityLog';

const ACTIVITY_TYPES: { value: ActivityLogEntry['type']; label: string }[] = [
  { value: 'optimization', label: 'Optimization' },
  { value: 'listing', label: 'Listing' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'alert_response', label: 'Alert response' },
  { value: 'report', label: 'Report' },
];

interface LogActivityDialogProps {
  onLogged?: () => void;
  addActivity: (entry: {
    client_id?: string | null;
    employee_id?: string | null;
    type: ActivityLogEntry['type'];
    title: string;
    description: string;
    impact?: string | null;
    performed_by: string;
  }) => Promise<{ data: ActivityLogEntry | null; error: string | null }>;
  trigger?: React.ReactNode;
}

export function LogActivityDialog({
  onLogged,
  addActivity,
  trigger,
}: LogActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState('');
  const [type, setType] = useState<ActivityLogEntry['type']>('optimization');
  const [clientId, setClientId] = useState<string>('');

  const { employee, user } = useAuth();
  const { clients } = useClients();

  const performedBy = employee?.name || user?.email?.split('@')[0] || 'User';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({ title: 'Required', description: 'Title and description are required.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const result = await addActivity({
        client_id: clientId || null,
        type,
        title: title.trim(),
        description: description.trim(),
        impact: impact.trim() || null,
        performed_by: performedBy,
      });
      if (result.error) {
        toast({
          title: 'Failed to log activity',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Activity logged', description: 'The activity has been added to the feed.' });
        setTitle('');
        setDescription('');
        setImpact('');
        setClientId('');
        setType('optimization');
        setOpen(false);
        onLogged?.();
      }
    } catch (err) {
      toast({
        title: 'Failed to log activity',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 ml-auto">
            <Plus className="w-4 h-4" />
            Log Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            Record an action taken on a client account. It will appear in the activity feed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Activity type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ActivityLogEntry['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Client (optional)</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company_name} – {c.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-title">Title</Label>
            <Input
              id="log-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campaign optimization"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-desc">Description</Label>
            <Textarea
              id="log-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was done?"
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="log-impact">Impact (optional)</Label>
            <Input
              id="log-impact"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="e.g. ROAS +15%"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Logging...' : 'Log Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
