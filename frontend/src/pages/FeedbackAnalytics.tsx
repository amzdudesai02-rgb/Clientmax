import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, TrendingDown, MessageSquare, BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const clientFeedback: Array<{ id: string; clientId: string; clientName: string; score: number; submittedAt: string; comment?: string }> = [];

const FeedbackAnalytics = () => {
  const overallAverage = clientFeedback.length
    ? (clientFeedback.reduce((sum, f) => sum + f.score, 0) / clientFeedback.length).toFixed(1)
    : '0.0';

  const sortedFeedback = [...clientFeedback].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const recentFeedback = sortedFeedback.slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  return (
    <AppLayout 
      title="Client Feedback Analytics" 
      subtitle="Track and analyze client satisfaction scores"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Average</p>
                <p className={`text-3xl font-bold ${getScoreColor(parseFloat(overallAverage))}`}>
                  {overallAverage}/10
                </p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-3xl font-bold">{clientFeedback.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promoters (8-10)</p>
                <p className="text-3xl font-bold text-success">
                  {clientFeedback.filter(f => f.score >= 8).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detractors (1-5)</p>
                <p className="text-3xl font-bold text-destructive">
                  {clientFeedback.filter(f => f.score <= 5).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest client feedback submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedback.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No feedback yet. Client feedback will appear here.</p>
            ) : (
            recentFeedback.map((feedback) => (
              <div 
                key={feedback.id} 
                className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium">{feedback.clientName}</p>
                    <Badge variant={getScoreBadgeVariant(feedback.score)}>
                      {feedback.score}/10
                    </Badge>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-muted-foreground">"{feedback.comment}"</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(feedback.submittedAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default FeedbackAnalytics;
