import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';

/**
 * Standalone page for changing password (e.g. from client portal).
 * Also available under Settings → Security for employees.
 */
const ChangePassword = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container max-w-md mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>
      <main className="container max-w-md mx-auto px-4 py-8 flex-1">
        <ChangePasswordForm />
      </main>
    </div>
  );
};

export default ChangePassword;
