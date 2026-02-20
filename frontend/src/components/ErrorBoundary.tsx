import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-8 h-8 shrink-0" />
                <h3 className="font-semibold text-lg">Something went wrong</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This page could not be loaded. You can try refreshing. If the problem continues, the activity log
                may not be set up yet—run the activity_log migration in Supabase.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
