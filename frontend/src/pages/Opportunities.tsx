import { AppLayout } from '@/components/layout/AppLayout';
import { OpportunityCards } from '@/components/dashboard/OpportunityCards';
import { Button } from '@/components/ui/button';
import type { Opportunity } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Target, 
  Rocket, 
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const opportunities: Opportunity[] = [];

const Opportunities = () => {
  const quickWins = opportunities.filter(o => o.type === 'quick_win');
  const mediumPlays = opportunities.filter(o => o.type === 'medium_play');
  const bigOpportunities = opportunities.filter(o => o.type === 'big_opportunity');

  const totalPotential = opportunities.reduce((sum, o) => sum + o.potentialRevenue, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <AppLayout 
      title="Opportunity Scanner" 
      subtitle="Identify and track growth opportunities across all clients"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
          <Zap className="w-8 h-8 text-success" />
          <div>
            <p className="text-2xl font-bold text-foreground">{quickWins.length}</p>
            <p className="text-sm text-muted-foreground">Quick Wins</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <Target className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{mediumPlays.length}</p>
            <p className="text-sm text-muted-foreground">Medium Plays</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <Rocket className="w-8 h-8 text-accent" />
          <div>
            <p className="text-2xl font-bold text-foreground">{bigOpportunities.length}</p>
            <p className="text-sm text-muted-foreground">Big Opportunities</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl gradient-primary text-primary-foreground">
          <DollarSign className="w-8 h-8" />
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalPotential)}</p>
            <p className="text-sm opacity-90">Total Potential/mo</p>
          </div>
        </div>
      </div>

      {/* Conversion Stats - real data only */}
      <div className="flex items-center gap-8 mb-6 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">{opportunities.length} opportunities identified</span>
        </div>
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All Opportunities
          </TabsTrigger>
          <TabsTrigger value="quick_win" className="gap-2">
            <Zap className="w-4 h-4" />
            Quick Wins
          </TabsTrigger>
          <TabsTrigger value="medium_play" className="gap-2">
            <Target className="w-4 h-4" />
            Medium Plays
          </TabsTrigger>
          <TabsTrigger value="big_opportunity" className="gap-2">
            <Rocket className="w-4 h-4" />
            Big Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OpportunityCards opportunities={opportunities} title="All Opportunities" />
        </TabsContent>
        <TabsContent value="quick_win">
          <OpportunityCards opportunities={quickWins} title="Quick Wins" />
        </TabsContent>
        <TabsContent value="medium_play">
          <OpportunityCards opportunities={mediumPlays} title="Medium Plays" />
        </TabsContent>
        <TabsContent value="big_opportunity">
          <OpportunityCards opportunities={bigOpportunities} title="Big Opportunities" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Opportunities;
