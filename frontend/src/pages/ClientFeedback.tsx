import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const ClientFeedback = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const clientName = searchParams.get('name') || 'Valued Client';
  const invoiceId = searchParams.get('invoiceId');
  
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (score === null) {
      toast({
        title: "Score Required",
        description: "Please select a rating from 1 to 10.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would submit to an API
    console.log({
      clientId,
      clientName,
      score,
      feedback,
      invoiceId,
      submittedAt: new Date().toISOString()
    });

    setIsSubmitted(true);
    toast({
      title: "Thank You!",
      description: "Your feedback has been submitted successfully.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback helps us improve our services. We appreciate your time!
            </p>
            <div className="flex items-center justify-center gap-1 pt-4">
              {[...Array(score || 0)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-warning fill-warning" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreLabel = (s: number) => {
    if (s <= 2) return 'Poor';
    if (s <= 4) return 'Fair';
    if (s <= 6) return 'Good';
    if (s <= 8) return 'Very Good';
    return 'Excellent';
  };

  const displayScore = hoveredScore ?? score;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>How was our service?</CardTitle>
          <CardDescription>
            Hi {clientName}, we'd love to hear your feedback about our services. 
            Please rate us on a scale of 1 to 10.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-center block">Your Rating</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScore(num)}
                    onMouseEnter={() => setHoveredScore(num)}
                    onMouseLeave={() => setHoveredScore(null)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-bold transition-all',
                      'border-2 hover:scale-110',
                      (score !== null && num <= score) || (hoveredScore !== null && num <= hoveredScore)
                        ? num <= 3 
                          ? 'bg-destructive border-destructive text-destructive-foreground'
                          : num <= 6 
                            ? 'bg-warning border-warning text-warning-foreground'
                            : 'bg-success border-success text-success-foreground'
                        : 'bg-muted border-border text-muted-foreground hover:border-primary'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {displayScore && (
                <p className="text-center text-sm font-medium text-muted-foreground">
                  {getScoreLabel(displayScore)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Additional Comments (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us more about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={score === null}>
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFeedback;
