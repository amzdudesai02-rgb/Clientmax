import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  UserPlus, 
  Edit2, 
  Trash2,
  Users
} from 'lucide-react';
import { JobPost, Interview, NewHire } from '@/types';
import { mockJobPosts, mockInterviews, mockNewHires, mockHiringMetrics } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Hiring = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [newHires, setNewHires] = useState<NewHire[]>(mockNewHires);
  
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);

  // Form states
  const [newJob, setNewJob] = useState({ title: '', department: '', closingDate: '' });
  const [newInterview, setNewInterview] = useState({ 
    candidateName: '', 
    candidateEmail: '', 
    jobPostId: '', 
    scheduledAt: '', 
    interviewerName: '' 
  });
  const [newHire, setNewHire] = useState({ 
    name: '', 
    email: '', 
    position: '', 
    department: '', 
    startDate: '', 
    manager: '' 
  });

  const handleAddJobPost = () => {
    if (!newJob.title || !newJob.department) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const job: JobPost = {
      id: `jp${Date.now()}`,
      title: newJob.title,
      department: newJob.department,
      status: 'active',
      applicants: 0,
      createdAt: new Date().toISOString().split('T')[0],
      closingDate: newJob.closingDate || undefined
    };
    
    setJobPosts([...jobPosts, job]);
    setNewJob({ title: '', department: '', closingDate: '' });
    setIsJobDialogOpen(false);
    toast({ title: "Success", description: "Job post created successfully" });
  };

  const handleAddInterview = () => {
    if (!newInterview.candidateName || !newInterview.jobPostId || !newInterview.scheduledAt) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const selectedJob = jobPosts.find(j => j.id === newInterview.jobPostId);
    const interview: Interview = {
      id: `int${Date.now()}`,
      candidateName: newInterview.candidateName,
      candidateEmail: newInterview.candidateEmail,
      jobPostId: newInterview.jobPostId,
      jobTitle: selectedJob?.title || '',
      status: 'scheduled',
      scheduledAt: newInterview.scheduledAt,
      interviewerName: newInterview.interviewerName
    };
    
    setInterviews([...interviews, interview]);
    setNewInterview({ candidateName: '', candidateEmail: '', jobPostId: '', scheduledAt: '', interviewerName: '' });
    setIsInterviewDialogOpen(false);
    toast({ title: "Success", description: "Interview scheduled successfully" });
  };

  const handleAddNewHire = () => {
    if (!newHire.name || !newHire.position || !newHire.department || !newHire.startDate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    const hire: NewHire = {
      id: `nh${Date.now()}`,
      name: newHire.name,
      email: newHire.email,
      position: newHire.position,
      department: newHire.department,
      startDate: newHire.startDate,
      status: 'onboarding',
      manager: newHire.manager
    };
    
    setNewHires([...newHires, hire]);
    setNewHire({ name: '', email: '', position: '', department: '', startDate: '', manager: '' });
    setIsHireDialogOpen(false);
    toast({ title: "Success", description: "New hire added successfully" });
  };

  const handleDeleteJob = (id: string) => {
    setJobPosts(jobPosts.filter(j => j.id !== id));
    toast({ title: "Deleted", description: "Job post removed" });
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(interviews.filter(i => i.id !== id));
    toast({ title: "Deleted", description: "Interview removed" });
  };

  const handleDeleteHire = (id: string) => {
    setNewHires(newHires.filter(h => h.id !== id));
    toast({ title: "Deleted", description: "New hire removed" });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-success/10 text-success',
      paused: 'bg-warning/10 text-warning',
      closed: 'bg-muted text-muted-foreground',
      filled: 'bg-primary/10 text-primary',
      scheduled: 'bg-primary/10 text-primary',
      completed: 'bg-success/10 text-success',
      cancelled: 'bg-destructive/10 text-destructive',
      no_show: 'bg-destructive/10 text-destructive',
      onboarding: 'bg-primary/10 text-primary',
      probation: 'bg-warning/10 text-warning'
    };
    return <Badge className={cn('capitalize', styles[status] || '')}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <AppLayout 
      title="Hiring & Interviews" 
      subtitle="Manage job posts, interviews, and new hires"
    >
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobPosts.filter(j => j.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">Active Job Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{interviews.filter(i => i.status === 'scheduled').length}</p>
              <p className="text-xs text-muted-foreground">Scheduled Interviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{newHires.length}</p>
              <p className="text-xs text-muted-foreground">New Hires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobPosts.reduce((sum, j) => sum + j.applicants, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Applicants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Job Posts
          </TabsTrigger>
          <TabsTrigger value="interviews" className="gap-2">
            <Calendar className="w-4 h-4" />
            Interviews
          </TabsTrigger>
          <TabsTrigger value="hires" className="gap-2">
            <UserPlus className="w-4 h-4" />
            New Hires
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Posts</CardTitle>
              <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Job Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Job Post</DialogTitle>
                    <DialogDescription>Add a new job opening to your hiring pipeline.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input 
                        value={newJob.title} 
                        onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                        placeholder="e.g., Amazon PPC Specialist"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select value={newJob.department} onValueChange={(v) => setNewJob({...newJob, department: v})}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Brand Management">Brand Management</SelectItem>
                          <SelectItem value="Account Management">Account Management</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Wholesale & TikTok">Wholesale & TikTok</SelectItem>
                          <SelectItem value="Wholesale Team">Wholesale Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Closing Date (Optional)</Label>
                      <Input 
                        type="date" 
                        value={newJob.closingDate} 
                        onChange={(e) => setNewJob({...newJob, closingDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsJobDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddJobPost}>Create Job Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPosts.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{job.applicants}</TableCell>
                      <TableCell>{job.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteJob(job.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interviews</CardTitle>
              <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Schedule Interview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                    <DialogDescription>Add a new interview to your schedule.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Candidate Name *</Label>
                      <Input 
                        value={newInterview.candidateName} 
                        onChange={(e) => setNewInterview({...newInterview, candidateName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Candidate Email</Label>
                      <Input 
                        type="email"
                        value={newInterview.candidateEmail} 
                        onChange={(e) => setNewInterview({...newInterview, candidateEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Post *</Label>
                      <Select value={newInterview.jobPostId} onValueChange={(v) => setNewInterview({...newInterview, jobPostId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                        <SelectContent>
                          {jobPosts.filter(j => j.status === 'active').map(job => (
                            <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Interview Date & Time *</Label>
                      <Input 
                        type="datetime-local" 
                        value={newInterview.scheduledAt} 
                        onChange={(e) => setNewInterview({...newInterview, scheduledAt: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interviewer</Label>
                      <Select value={newInterview.interviewerName} onValueChange={(v) => setNewInterview({...newInterview, interviewerName: v})}>
                        <SelectTrigger><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asad">Asad</SelectItem>
                          <SelectItem value="Munaam">Munaam</SelectItem>
                          <SelectItem value="SHK">SHK</SelectItem>
                          <SelectItem value="Aqib">Aqib</SelectItem>
                          <SelectItem value="Osama">Osama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInterviewDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddInterview}>Schedule Interview</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{interview.candidateName}</p>
                          <p className="text-xs text-muted-foreground">{interview.candidateEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{interview.jobTitle}</TableCell>
                      <TableCell>{getStatusBadge(interview.status)}</TableCell>
                      <TableCell>{new Date(interview.scheduledAt).toLocaleDateString()}</TableCell>
                      <TableCell>{interview.interviewerName}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteInterview(interview.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hires">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New Hires</CardTitle>
              <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Hire
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Hire</DialogTitle>
                    <DialogDescription>Record a new team member joining.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input 
                          value={newHire.name} 
                          onChange={(e) => setNewHire({...newHire, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={newHire.email} 
                          onChange={(e) => setNewHire({...newHire, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position *</Label>
                        <Input 
                          value={newHire.position} 
                          onChange={(e) => setNewHire({...newHire, position: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Department *</Label>
                        <Select value={newHire.department} onValueChange={(v) => setNewHire({...newHire, department: v})}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Brand Management">Brand Management</SelectItem>
                            <SelectItem value="Account Management">Account Management</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                            <SelectItem value="Wholesale & TikTok">Wholesale & TikTok</SelectItem>
                            <SelectItem value="Wholesale Team">Wholesale Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input 
                          type="date" 
                          value={newHire.startDate} 
                          onChange={(e) => setNewHire({...newHire, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Manager</Label>
                        <Select value={newHire.manager} onValueChange={(v) => setNewHire({...newHire, manager: v})}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asad">Asad</SelectItem>
                            <SelectItem value="Munaam">Munaam</SelectItem>
                            <SelectItem value="SHK">SHK</SelectItem>
                            <SelectItem value="Aqib">Aqib</SelectItem>
                            <SelectItem value="Osama">Osama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsHireDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNewHire}>Add New Hire</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newHires.map((hire) => (
                    <TableRow key={hire.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hire.name}</p>
                          <p className="text-xs text-muted-foreground">{hire.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{hire.position}</TableCell>
                      <TableCell>{hire.department}</TableCell>
                      <TableCell>{getStatusBadge(hire.status)}</TableCell>
                      <TableCell>{hire.startDate}</TableCell>
                      <TableCell>{hire.manager}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteHire(hire.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Hiring;
