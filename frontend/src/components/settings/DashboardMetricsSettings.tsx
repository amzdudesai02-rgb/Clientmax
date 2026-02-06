import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, RefreshCw, DollarSign, Users, TrendingUp, BarChart3, Star, Clock } from 'lucide-react';

interface MetricConfig {
  key: string;
  label: string;
  description: string;
  type: 'number' | 'currency' | 'percentage';
  icon: React.ReactNode;
}

const metricsConfig: MetricConfig[] = [
  { key: 'total_clients', label: 'Total Clients', description: 'Number of active clients', type: 'number', icon: <Users className="w-4 h-4" /> },
  { key: 'clients_added_this_month', label: 'New Clients (This Month)', description: 'Clients added this month', type: 'number', icon: <Users className="w-4 h-4" /> },
  { key: 'clients_lost_this_month', label: 'Churned Clients', description: 'Clients lost this month', type: 'number', icon: <Users className="w-4 h-4" /> },
  { key: 'total_mrr', label: 'Monthly Recurring Revenue', description: 'Total MRR in dollars', type: 'currency', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'mrr_change', label: 'MRR Change %', description: 'MRR change vs last month', type: 'percentage', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'avg_client_score', label: 'Avg Client Score', description: 'Average feedback score (1-10)', type: 'number', icon: <Star className="w-4 h-4" /> },
  { key: 'attendance_score', label: 'Attendance Score', description: 'Team attendance percentage', type: 'percentage', icon: <Clock className="w-4 h-4" /> },
  { key: 'quarterly_revenue', label: 'Quarterly Revenue', description: 'Current quarter revenue', type: 'currency', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'opportunities_pipeline', label: 'Opportunities Pipeline', description: 'Number of opportunities', type: 'number', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'opportunities_potential', label: 'Pipeline Potential Value', description: 'Potential revenue from opportunities', type: 'currency', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'team_utilization', label: 'Team Utilization', description: 'Average team utilization %', type: 'percentage', icon: <BarChart3 className="w-4 h-4" /> }
];

export const DashboardMetricsSettings = () => {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('metric_key, metric_value');
      
      if (error) throw error;

      const metricsMap: Record<string, number> = {};
      data?.forEach(m => {
        metricsMap[m.metric_key] = Number(m.metric_value);
      });
      setMetrics(metricsMap);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(metrics).map(([key, value]) => ({
        metric_key: key,
        metric_value: value,
        last_updated_by: 'Admin'
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('dashboard_metrics')
          .update({ 
            metric_value: update.metric_value, 
            last_updated_by: update.last_updated_by 
          })
          .eq('metric_key', update.metric_key);

        if (error) throw error;
      }

      toast.success('Dashboard metrics saved successfully!');
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save metrics');
    } finally {
      setIsSaving(false);
    }
  };

  const formatValue = (value: number, type: 'number' | 'currency' | 'percentage') => {
    switch (type) {
      case 'currency':
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Dashboard Metrics
        </CardTitle>
        <CardDescription>
          Manually update your dashboard KPIs. These values will be displayed on your main dashboard until API integrations are set up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricsConfig.map((config) => (
            <div key={config.key} className="space-y-2">
              <Label htmlFor={config.key} className="flex items-center gap-2">
                {config.icon}
                {config.label}
              </Label>
              <div className="relative">
                {config.type === 'currency' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                )}
                <Input
                  id={config.key}
                  type="number"
                  value={metrics[config.key] || 0}
                  onChange={(e) => handleChange(config.key, e.target.value)}
                  className={config.type === 'currency' ? 'pl-7' : ''}
                  step={config.type === 'percentage' || config.key === 'avg_client_score' ? '0.1' : '1'}
                />
                {config.type === 'percentage' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Metrics'}
          </Button>
          <Button variant="outline" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 text-sm">
          <p className="font-medium mb-2">💡 Pro Tip: Future Automation</p>
          <p className="text-muted-foreground">
            Once you connect Amazon SP-API, revenue and ad spend metrics will update automatically. 
            Client scores will also auto-update from the Client Feedback system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
