import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Building2, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Key,
  Mail,
  User,
  RefreshCw,
  Trash2,
  KeyRound
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface Employee {
  id: string;
  name: string;
  email: string;
  auth_user_id: string | null;
  role: string;
}

interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  auth_user_id: string | null;
  client_type: string;
}

export function AccountManagement() {
  const { employee, loading: authLoading, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Account Management is restricted to junaid@amzdudes.com only
  const userEmail = user?.email || employee?.email || '';
  const isAuthorizedCEO = employee?.role === 'CEO' && userEmail === 'junaid@amzdudes.com';
  
  if (!authLoading && !isAuthorizedCEO) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access restricted. Only junaid@amzdudes.com can create accounts for employees and clients.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  const [creating, setCreating] = useState(false);
  
  // Form state for new account
  const [selectedType, setSelectedType] = useState<'employee' | 'client'>('employee');
  const [selectedRecord, setSelectedRecord] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password reset dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ 
    type: 'employee' | 'client'; 
    record: Employee | Client;
  } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ 
    type: 'employee' | 'client'; 
    record: Employee | Client;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empResult, clientResult] = await Promise.all([
        supabase.from('employees').select('id, name, email, auth_user_id, role').order('name'),
        supabase.from('clients').select('id, company_name, contact_name, email, auth_user_id, client_type').order('company_name')
      ]);
      
      setEmployees((empResult.data || []) as Employee[]);
      setClients((clientResult.data || []) as Client[]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateInputs = (email: string) => {
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

  const handleCreateAccount = async () => {
    setError(null);
    setSuccess(null);
    
    if (!selectedRecord) {
      setError('Please select a record to create an account for');
      return;
    }
    
    const record = selectedType === 'employee' 
      ? employees.find(e => e.id === selectedRecord)
      : clients.find(c => c.id === selectedRecord);
    
    if (!record) {
      setError('Selected record not found');
      return;
    }
    
    if (!validateInputs(record.email)) return;
    
    setCreating(true);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: record.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // Link the auth user to the record
      if (selectedType === 'employee') {
        const { error: linkError } = await supabase
          .from('employees')
          .update({ auth_user_id: authData.user.id })
          .eq('id', selectedRecord);
        
        if (linkError) throw linkError;
        
        // Add employee role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'employee'
        });
      } else {
        const { error: linkError } = await supabase
          .from('clients')
          .update({ auth_user_id: authData.user.id })
          .eq('id', selectedRecord);
        
        if (linkError) throw linkError;
        
        // Add client role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'client'
        });
      }
      
      setSuccess(`Account created successfully for ${record.email}`);
      setPassword('');
      setSelectedRecord('');
      toast.success('Account created successfully!');
      fetchData();
      
    } catch (err: unknown) {
      console.error('Error creating account:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      if (error.message?.includes('already registered')) {
        setError('This email is already registered. Please use a different email or reset the password.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;
    
    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }
    
    setResetting(true);
    
    try {
      const authUserId = resetTarget.type === 'employee' 
        ? (resetTarget.record as Employee).auth_user_id 
        : (resetTarget.record as Client).auth_user_id;
      
      if (!authUserId) {
        throw new Error('User does not have an account');
      }
      
      const { data, error } = await supabase.functions.invoke('manage-user-account', {
        body: {
          action: 'reset_password',
          user_id: authUserId,
          new_password: newPassword,
          user_type: resetTarget.type,
          record_id: resetTarget.record.id
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast.success('Password reset successfully! Share the new password with the user.');
      setResetDialogOpen(false);
      setNewPassword('');
      setResetTarget(null);
      
    } catch (err: unknown) {
      console.error('Error resetting password:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    
    try {
      const authUserId = deleteTarget.type === 'employee' 
        ? (deleteTarget.record as Employee).auth_user_id 
        : (deleteTarget.record as Client).auth_user_id;
      
      if (!authUserId) {
        throw new Error('User does not have an account');
      }
      
      const { data, error } = await supabase.functions.invoke('manage-user-account', {
        body: {
          action: 'delete_user',
          user_id: authUserId,
          user_type: deleteTarget.type,
          record_id: deleteTarget.record.id
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      toast.success('Login access revoked successfully');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
      
    } catch (err: unknown) {
      console.error('Error deleting account:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || 'Failed to revoke access');
    } finally {
      setDeleting(false);
    }
  };

  const getUnlinkedRecords = () => {
    if (selectedType === 'employee') {
      return employees.filter(e => !e.auth_user_id);
    }
    return clients.filter(c => !c.auth_user_id);
  };

  const openResetDialog = (type: 'employee' | 'client', record: Employee | Client) => {
    setResetTarget({ type, record });
    setNewPassword('');
    setResetDialogOpen(true);
  };

  const openDeleteDialog = (type: 'employee' | 'client', record: Employee | Client) => {
    setDeleteTarget({ type, record });
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Account Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Login Account
          </CardTitle>
          <CardDescription>
            Create authentication accounts for employees and clients to access their portals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant={selectedType === 'employee' ? 'default' : 'outline'}
              onClick={() => { setSelectedType('employee'); setSelectedRecord(''); }}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Employee
            </Button>
            <Button
              variant={selectedType === 'client' ? 'default' : 'outline'}
              onClick={() => { setSelectedType('client'); setSelectedRecord(''); }}
              className="gap-2"
            >
              <Building2 className="w-4 h-4" />
              Client
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select {selectedType === 'employee' ? 'Employee' : 'Client'}</Label>
              <Select value={selectedRecord} onValueChange={setSelectedRecord}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${selectedType} without login...`} />
                </SelectTrigger>
                <SelectContent>
                  {getUnlinkedRecords().length === 0 ? (
                    <SelectItem value="none" disabled>
                      All {selectedType}s have accounts
                    </SelectItem>
                  ) : (
                    getUnlinkedRecords().map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {selectedType === 'employee' 
                          ? `${(record as Employee).name} (${record.email})`
                          : `${(record as Client).company_name} - ${(record as Client).contact_name}`
                        }
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setPassword(`Welcome${Math.random().toString(36).slice(-6)}!`)}
                  title="Generate random password"
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password securely with the user
              </p>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">{success}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleCreateAccount} 
            disabled={creating || !selectedRecord || !password}
            className="gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Account
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Existing Accounts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Existing Accounts</CardTitle>
            <CardDescription>Manage users with login access</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees">
            <TabsList>
              <TabsTrigger value="employees" className="gap-2">
                <Users className="w-4 h-4" />
                Employees ({employees.filter(e => e.auth_user_id).length})
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Building2 className="w-4 h-4" />
                Clients ({clients.filter(c => c.auth_user_id).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="employees" className="mt-4">
              <div className="space-y-2">
                {employees.map((emp) => (
                  <div 
                    key={emp.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {emp.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {emp.role}
                      </Badge>
                      {emp.auth_user_id ? (
                        <>
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Has Login
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openResetDialog('employee', emp)}
                            title="Reset password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog('employee', emp)}
                            title="Revoke access"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">
                          No Login
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No employees found
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="clients" className="mt-4">
              <div className="space-y-2">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{client.company_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.contact_name} • {client.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {client.client_type.replace('_', ' ')}
                      </Badge>
                      {client.auth_user_id ? (
                        <>
                          <Badge className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Has Login
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openResetDialog('client', client)}
                            title="Reset password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog('client', client)}
                            title="Revoke access"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">
                          No Login
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No clients found
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {resetTarget && (
                <>
                  Set a new password for{' '}
                  <strong>
                    {resetTarget.type === 'employee' 
                      ? (resetTarget.record as Employee).name 
                      : (resetTarget.record as Client).contact_name}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setNewPassword(`Reset${Math.random().toString(36).slice(-6)}!`)}
                  title="Generate random password"
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Share this password securely with the user.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={resetting || !newPassword}
            >
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Login Access?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  This will remove login access for{' '}
                  <strong>
                    {deleteTarget.type === 'employee' 
                      ? (deleteTarget.record as Employee).name 
                      : (deleteTarget.record as Client).contact_name}
                  </strong>
                  . They will no longer be able to sign in. The {deleteTarget.type} record will remain in the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Access'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
