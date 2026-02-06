import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, 
  Gift, 
  Trophy, 
  TrendingUp,
  Mail,
  Star,
  ArrowRight
} from 'lucide-react';

const mockReferrals = [
  {
    id: '1',
    referredBy: 'NaturaCare Supplements',
    referralName: 'Organic Beauty Co',
    status: 'contacted',
    date: '2026-01-12',
    potentialMRR: 2500,
  },
  {
    id: '2',
    referredBy: 'TechGear Pro',
    referralName: 'SmartHome Innovations',
    status: 'meeting_set',
    date: '2026-01-08',
    potentialMRR: 1800,
  },
  {
    id: '3',
    referredBy: 'Seoul Snacks Co',
    referralName: 'Asian Delights',
    status: 'won',
    date: '2025-12-15',
    potentialMRR: 1500,
  },
];

const topReferrers = [
  { name: 'NaturaCare Supplements', referrals: 5, revenue: 8500 },
  { name: 'TechGear Pro', referrals: 3, revenue: 5200 },
  { name: 'Seoul Snacks Co', referrals: 2, revenue: 3000 },
];

const Referrals = () => {
  return (
    <AppLayout 
      title="Referral Engine" 
      subtitle="Track and manage client referrals"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Total Referrals
            </CardDescription>
            <CardTitle className="text-3xl">28</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Conversion Rate
            </CardDescription>
            <CardTitle className="text-3xl">64%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Referred Revenue
            </CardDescription>
            <CardTitle className="text-3xl">$42K</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards Issued
            </CardDescription>
            <CardTitle className="text-3xl">$4,200</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Referrals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Referrals</CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Send Referral Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReferrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{referral.referralName}</p>
                      <p className="text-sm text-muted-foreground">
                        Referred by {referral.referredBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline"
                        className={
                          referral.status === 'won' ? 'bg-success/10 text-success border-success/20' :
                          referral.status === 'meeting_set' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {referral.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        ${referral.potentialMRR.toLocaleString()}/mo
                      </span>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-warning" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topReferrers.map((referrer, index) => (
                <div key={referrer.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{referrer.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {referrer.referrals} referrals
                    </span>
                  </div>
                  <Progress value={(referrer.referrals / 5) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    ${referrer.revenue.toLocaleString()} in referred revenue
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Referrals;
