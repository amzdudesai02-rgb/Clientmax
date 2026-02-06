import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Send,
  CheckCircle2,
  Clock,
  FileText,
  User
} from 'lucide-react';
import { mockClients, mockClientFeedback, generatePerformanceData } from '@/data/mockData';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, parseISO } from 'date-fns';

const ClientPortal = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId') || '1';
  
  const client = mockClients.find(c => c.id === clientId);
  const clientFeedback = mockClientFeedback.filter(f => f.clientId === clientId);
  const performanceData = generatePerformanceData(clientId);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'manager',
      senderName: client?.assignedManager || 'Account Manager',
      senderType: 'manager' as const,
      message: `Hi ${client?.name || 'there'}! Welcome to your client portal. Feel free to reach out if you have any questions about your account.`,
      timestamp: '2026-01-15T10:00:00Z',
      read: true
    },
    {
      id: '2',
      senderId: clientId,
      senderName: client?.name || 'Client',
      senderType: 'client' as const,
      message: 'Thanks! I was wondering about the performance of my campaigns this week.',
      timestamp: '2026-01-15T14:30:00Z',
      read: true
    },
    {
      id: '3',
      senderId: 'manager',
      senderName: client?.assignedManager || 'Account Manager',
      senderType: 'manager' as const,
      message: 'Great question! Your campaigns are performing well. ROAS is up 15% compared to last week. I\'ve made some optimizations to your keyword bids that should help even more.',
      timestamp: '2026-01-15T15:00:00Z',
      read: true
    }
  ]);

  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Client not found. Please check the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      senderId: clientId,
      senderName: client.name,
      senderType: 'client' as const,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    }]);
    setMessage('');
    
    toast({
      title: "Message Sent",
      description: "Your account manager will respond shortly.",
    });
  };

  const handleSubmitFeedback = () => {
    if (!feedbackScore) {
      toast({
        title: "Please select a score",
        description: "Click on a star to rate our service.",
        variant: "destructive"
      });
      return;
    }

    console.log({
      clientId,
      clientName: client.name,
      score: feedbackScore,
      feedback: feedbackText,
      submittedAt: new Date().toISOString()
    });

    setFeedbackSubmitted(true);
    toast({
      title: "Thank you for your feedback!",
      description: "Your feedback helps us improve our service.",
    });
  };

  const avgFeedbackScore = clientFeedback.length > 0 
    ? (clientFeedback.reduce((sum, f) => sum + f.score, 0) / clientFeedback.length).toFixed(1)
    : 'N/A';

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    adSpend: {
      label: "Ad Spend",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.companyName}</h1>
              <p className="text-muted-foreground">Client Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Account Manager</p>
                <p className="font-medium text-foreground">{client.assignedManager}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <Star className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">30-Day Revenue</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${client.revenue30Days.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ROAS</p>
                      <p className="text-2xl font-bold text-foreground">{client.roas}x</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Health Score</p>
                      <p className="text-2xl font-bold text-foreground">{client.healthScore}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rating</p>
                      <p className="text-2xl font-bold text-foreground">{avgFeedbackScore}/10</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-warning fill-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Package</span>
                    <Badge variant="secondary">{client.package}</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Monthly Investment</span>
                    <span className="font-medium">${client.mrr.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Ad Spend (30d)</span>
                    <span className="font-medium">${client.adSpend30Days.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Client Since</span>
                    <span className="font-medium">{format(parseISO(client.activeSince), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Last Contact</span>
                    <span className="font-medium">{format(parseISO(client.lastContactDate), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Campaign Optimization</p>
                        <p className="text-xs text-muted-foreground">Improved bids on top performing keywords</p>
                        <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Weekly Report Sent</p>
                        <p className="text-xs text-muted-foreground">Your performance report was delivered</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Strategy Call Scheduled</p>
                        <p className="text-xs text-muted-foreground">Monthly review call next week</p>
                        <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Ad Spend (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="adSpend" 
                          stroke="hsl(var(--muted-foreground))" 
                          fill="hsl(var(--muted-foreground) / 0.1)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Orders (30d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {performanceData.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sessions (30d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {performanceData.reduce((sum, d) => sum + d.sessions, 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {((performanceData.reduce((sum, d) => sum + d.conversions, 0) / 
                        performanceData.reduce((sum, d) => sum + d.sessions, 0)) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages with Your Account Manager</CardTitle>
                <CardDescription>
                  Communicate directly with {client.assignedManager}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.senderType === 'client' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {msg.senderName}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-50 mt-2">
                            {format(parseISO(msg.timestamp), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit Feedback</CardTitle>
                  <CardDescription>
                    Let us know how we're doing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feedbackSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground">
                        Your feedback has been submitted successfully.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium mb-3">How would you rate our service?</p>
                        <div className="flex gap-1 justify-center">
                          {Array.from({ length: 10 }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setFeedbackScore(i + 1)}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`w-6 h-6 ${
                                  feedbackScore && i < feedbackScore 
                                    ? 'text-warning fill-warning' 
                                    : 'text-muted-foreground/30'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        {feedbackScore && (
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            {feedbackScore}/10
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Additional Comments (Optional)</label>
                        <Textarea
                          placeholder="Tell us more about your experience..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <Button onClick={handleSubmitFeedback} className="w-full">
                        Submit Feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Feedback History</CardTitle>
                </CardHeader>
                <CardContent>
                  {clientFeedback.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No feedback submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {clientFeedback.map((feedback) => (
                        <div 
                          key={feedback.id}
                          className="p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 10 }, (_, i) => (
                                <Star 
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < feedback.score 
                                      ? 'text-warning fill-warning' 
                                      : 'text-muted-foreground/30'
                                  }`} 
                                />
                              ))}
                            </div>
                            <Badge variant="outline">{feedback.score}/10</Badge>
                          </div>
                          {feedback.feedback && (
                            <p className="text-sm text-muted-foreground mb-2">
                              "{feedback.feedback}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(feedback.submittedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientPortal;
