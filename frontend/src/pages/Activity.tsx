import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { mockActivities } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Calendar } from 'lucide-react';

const Activity = () => {
  return (
    <AppLayout 
      title="Activity Feed" 
      subtitle="Track all actions taken across client accounts"
    >
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search activities..." 
            className="pl-9"
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wholesaler">Wholesalers</SelectItem>
            <SelectItem value="brand_owner">Brand Owners</SelectItem>
            <SelectItem value="3p_seller">3P Sellers</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Team Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Team</SelectItem>
            <SelectItem value="asad">Asad</SelectItem>
            <SelectItem value="munaam">Munaam</SelectItem>
            <SelectItem value="shk">SHK</SelectItem>
            <SelectItem value="aqib">Aqib</SelectItem>
            <SelectItem value="osama">Osama</SelectItem>
            <SelectItem value="junaid">Junaid</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Date Range
        </Button>

        <Button className="gap-2 ml-auto">
          <Plus className="w-4 h-4" />
          Log Activity
        </Button>
      </div>

      {/* Activity Feed */}
      <ActivityFeed activities={mockActivities} title="All Activities" />
    </AppLayout>
  );
};

export default Activity;
