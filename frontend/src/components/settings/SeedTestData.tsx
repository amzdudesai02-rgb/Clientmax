import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Beaker, Loader2 } from 'lucide-react';

const PSEUDO_CLIENT = {
  company_name: 'Demo Company',
  contact_name: 'Demo Contact',
  email: 'demo@example.com',
  client_type: 'brand_owner' as const,
  health_score: 75,
  health_status: 'good' as const,
  mrr: 5000,
  package: 'Standard',
  assigned_employee_id: null as string | null,
  assigned_team_lead_id: null as string | null,
  email_notifications_enabled: true,
  amazon_connected: false,
  amazon_seller_id: null as string | null,
};

export function SeedTestData() {
  const [seeding, setSeeding] = useState(false);
  const { employee } = useAuth();
  const { addClient, refetch } = useClients();

  const handleSeed = async () => {
    if (!employee?.id) {
      toast({
        title: 'Cannot seed',
        description: 'You must be logged in as an employee to seed test data.',
        variant: 'destructive',
      });
      return;
    }
    setSeeding(true);
    try {
      const inserted = await addClient(PSEUDO_CLIENT);
      await refetch();

      const { error: updateError } = await supabase.from('daily_updates').insert({
        client_id: inserted.id,
        employee_id: employee.id,
        update_text: 'Pseudo activity: Campaign review completed. Key metrics look good. Recommend increasing budget on top performers next week.',
        category: 'campaign_optimization',
        approved_for_client: true,
        is_growth_opportunity: false,
        feedback_requested: false,
      });

      if (updateError) throw updateError;

      toast({
        title: 'Test data added',
        description: `Client "${PSEUDO_CLIENT.company_name}" and one approved update were created. Open Portals → Employee for that client to see logs; open Smart Portal with clientId=${inserted.id} to see the update as client.`,
      });
    } catch (err) {
      toast({
        title: 'Seed failed',
        description: err instanceof Error ? err.message : 'Could not create test data.',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="w-5 h-5" />
          Test data
        </CardTitle>
        <CardDescription>
          Add a pseudo client and one approved employee update so you can test the full flow (employee logs → client visibility, portals, reports) without real data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeed} disabled={seeding} className="gap-2">
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Beaker className="w-4 h-4" />}
          {seeding ? 'Seeding...' : 'Seed test client and activity'}
        </Button>
      </CardContent>
    </Card>
  );
}
