import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import type { Client, ClientType } from '@/types';

const clientFormSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  companyName: z.string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name must be less than 100 characters' }),
  type: z.enum(['brand_owner', 'reseller', 'wholesaler', 'product_launcher', '3p_seller'], {
    required_error: 'Please select a client type',
  }),
  assignedManager: z.string()
    .min(1, { message: 'Please select a manager' }),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface AddClientModalProps {
  onClientAdded?: (client: Client) => void;
  trigger?: React.ReactNode;
}

const clientTypeLabels: Record<ClientType, string> = {
  brand_owner: 'Brand Owner',
  reseller: 'Reseller',
  wholesaler: 'Wholesaler',
  product_launcher: 'Product Launcher',
  '3p_seller': '3P Seller',
};

const managers = [
  { id: 'alex', name: 'Alex Thompson' },
  { id: 'jordan', name: 'Jordan Martinez' },
  { id: 'casey', name: 'Casey Williams' },
];

export const AddClientModal = ({ onClientAdded, trigger }: AddClientModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addClient, refetch } = useClients();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      type: undefined,
      assignedManager: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const inserted = await addClient({
        company_name: data.companyName,
        contact_name: data.name,
        email: data.email,
        client_type: data.type as 'brand_owner' | 'wholesaler' | '3p_seller',
        health_score: 75,
        health_status: 'good',
        mrr: 0,
        package: '',
        assigned_employee_id: null,
        assigned_team_lead_id: null,
        email_notifications_enabled: true,
        amazon_connected: false,
        amazon_seller_id: null,
      });
      await refetch();
      const clientForCallback: Client = { id: inserted.id, name: inserted.contact_name, companyName: inserted.company_name, type: inserted.client_type, healthScore: inserted.health_score, healthStatus: inserted.health_status, revenue30Days: 0, adSpend30Days: 0, roas: 0, assignedManager: '', package: inserted.package, mrr: inserted.mrr, lastContactDate: new Date().toISOString(), alertsActive: 0, activeSince: new Date().toISOString() };
      onClientAdded?.(clientForCallback);
      toast({
        title: 'Client Added Successfully',
        description: `${data.companyName} has been added to your client list.`,
      });
      setOpen(false);
      form.reset();
    } catch (err) {
      toast({
        title: 'Failed to add client',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the client details below. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(clientTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedManager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Manager</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
