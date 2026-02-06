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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  package: z.string()
    .min(1, { message: 'Please enter a package name' })
    .max(50, { message: 'Package name must be less than 50 characters' }),
  mrr: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'MRR must be a positive number',
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

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      companyName: '',
      type: undefined,
      package: '',
      mrr: '',
      assignedManager: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create new client object
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: data.name,
      companyName: data.companyName,
      type: data.type,
      healthScore: 75, // Default starting health score
      healthStatus: 'good',
      revenue30Days: 0,
      adSpend30Days: 0,
      roas: 0,
      assignedManager: managers.find(m => m.id === data.assignedManager)?.name || data.assignedManager,
      package: data.package,
      mrr: Number(data.mrr),
      lastContactDate: new Date().toISOString(),
      alertsActive: 0,
      activeSince: new Date().toISOString(),
    };

    // Call callback if provided
    onClientAdded?.(newClient);

    toast({
      title: 'Client Added Successfully',
      description: `${data.companyName} has been added to your client list.`,
    });

    setIsSubmitting(false);
    setOpen(false);
    form.reset();
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package</FormLabel>
                    <FormControl>
                      <Input placeholder="Growth Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mrr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Recurring Revenue</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>USD per month</FormDescription>
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
