import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Building2, Users, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClientAuth } from '@/hooks/useClientAuth';
import { isClientAllowedFromPath, isEmployeeAllowedFromPath } from '@/components/ProtectedRoute';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn: employeeSignIn, signOut: employeeSignOut, employee, loading: employeeLoading } = useAuth();
  const { signIn: clientSignIn, client, loading: clientLoading } = useClientAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'employee' | 'client'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWakeUpMessage, setShowWakeUpMessage] = useState(false);

  const isEmployee = !!employee;
  const isClient = !!client;
  const isAuthenticated = isEmployee || isClient;
  const locationState = location.state as { from?: { pathname: string }; restricted?: string } | null;
  const isRestrictedCEO = locationState?.restricted === 'CEO only';

  // If sent here because access is CEO-only (for admin features), show message
  useEffect(() => {
    if (isRestrictedCEO && isEmployee) {
      setError('Access restricted to CEO. This feature is only available to administrators.');
    }
  }, [isRestrictedCEO, isEmployee]);

  // Set body background to dark when login page mounts
  useEffect(() => {
    const originalBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0a0a0a';
    document.documentElement.style.backgroundColor = '#0a0a0a';
    
    return () => {
      document.body.style.backgroundColor = originalBackground;
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // Redirect if already authenticated, to the correct home by role (skip when showing CEO restriction)
  useEffect(() => {
    if (isRestrictedCEO) return;
    if (employeeLoading || clientLoading) return;
    if (!isAuthenticated) return;

    const from = locationState?.from?.pathname;

    if (isEmployee) {
      // All employees (CEO and regular) can access employee dashboard
      const target = from && isEmployeeAllowedFromPath(from) ? from : '/';
      navigate(target, { replace: true });
    } else if (isClient) {
      const target = from && isClientAllowedFromPath(from) ? from : '/smart-portal';
      navigate(target, { replace: true });
    }
  }, [isEmployee, isClient, isAuthenticated, employee?.role, employeeLoading, clientLoading, navigate, location, locationState, isRestrictedCEO]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowWakeUpMessage(false);
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    // Show wake-up message after 5 seconds
    const wakeUpTimer = setTimeout(() => {
      setShowWakeUpMessage(true);
    }, 5000);

    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Login timeout: Service may be waking up. Please wait and try again.'));
        }, 30000);
      });

      if (userType === 'employee') {
        const signInPromise = employeeSignIn(email, password);
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const { error } = result as any;
        
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message || 'Login failed. Please try again.');
          }
        } else {
          const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
          const target = from && isEmployeeAllowedFromPath(from) ? from : '/';
          navigate(target, { replace: true });
        }
      } else {
        const signInPromise = clientSignIn(email, password);
        const result = await Promise.race([signInPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        const { error } = result as any;
        
        if (error) {
          if (error.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message || 'Login failed. Please try again.');
          }
        } else {
          const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
          const target = from && isClientAllowedFromPath(from) ? from : '/smart-portal';
          navigate(target, { replace: true });
        }
      }
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      if (err.message?.includes('timeout')) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      clearTimeout(wakeUpTimer);
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
      setShowWakeUpMessage(false);
    }
  };

  if (employeeLoading || clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 fixed inset-0 overflow-y-auto" 
      style={{ backgroundColor: '#0a0a0a', zIndex: 9999 }}
    >
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <img 
              src={`/logo.png?t=${new Date().getTime()}&v=8`}
              alt="amzDUDES Logo" 
              className="h-24 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback to amz-logo.png if logo.png fails
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('amz-logo.png')) {
                  target.src = `/amz-logo.png?t=${new Date().getTime()}&v=8`;
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to access your dashboard</p>
          {/* Theme: Black - Updated v3 - Cache Fix */}
        </div>

        <Card className="w-full shadow-2xl border border-gray-800 bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="text-sm font-semibold mb-4 block text-gray-300">I am a:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={userType === 'employee' ? 'default' : 'outline'}
                  className={`h-auto py-4 flex flex-col items-center gap-2 transition-all ${
                    userType === 'employee' 
                      ? 'bg-primary hover:bg-primary/90 shadow-md' 
                      : 'hover:bg-gray-800 border-gray-700 text-gray-300'
                  }`}
                  onClick={() => {
                    setUserType('employee');
                    setError(null);
                  }}
                >
                  <Users className={`w-5 h-5 ${userType === 'employee' ? 'text-primary-foreground' : 'text-gray-400'}`} />
                  <span className={`font-medium ${userType === 'employee' ? 'text-primary-foreground' : 'text-gray-300'}`}>Employee</span>
                </Button>
                <Button
                  type="button"
                  variant={userType === 'client' ? 'default' : 'outline'}
                  className={`h-auto py-4 flex flex-col items-center gap-2 transition-all ${
                    userType === 'client' 
                      ? 'bg-primary hover:bg-primary/90 shadow-md' 
                      : 'hover:bg-gray-800 border-gray-700 text-gray-300'
                  }`}
                  onClick={() => {
                    setUserType('client');
                    setError(null);
                  }}
                >
                  <Building2 className={`w-5 h-5 ${userType === 'client' ? 'text-primary-foreground' : 'text-gray-400'}`} />
                  <span className={`font-medium ${userType === 'client' ? 'text-primary-foreground' : 'text-gray-300'}`}>Client</span>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-semibold text-gray-300">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder={userType === 'employee' ? 'you@amzdudes.com' : 'you@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-sm font-semibold text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="pr-10 h-11 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showWakeUpMessage && !error && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Service is waking up... Free tier services may take up to 30 seconds to respond after inactivity. Please wait.
                </AlertDescription>
              </Alert>
            )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-shadow" 
                disabled={loading} 
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {userType === 'client' && (
                <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                  Your login credentials are provided by your account manager.
                  <br />
                  Contact support if you need access.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 amzDUDES. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;

