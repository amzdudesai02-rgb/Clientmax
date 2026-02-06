import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Settings, 
  Star,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { mockReportTemplates } from '@/data/mockData';
import type { ReportTemplate, ReportSection } from '@/types';
import { toast } from '@/hooks/use-toast';

const sectionTypeLabels: Record<string, string> = {
  metrics: 'Key Metrics',
  chart: 'Performance Chart',
  table: 'Data Table',
  text: 'Text Summary',
  alerts: 'Alerts Overview',
  opportunities: 'Opportunities',
};

const sectionTypeIcons: Record<string, string> = {
  metrics: '📊',
  chart: '📈',
  table: '📋',
  text: '📝',
  alerts: '⚠️',
  opportunities: '💡',
};

export function TemplateManager() {
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockReportTemplates);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const handleToggleSection = (templateId: string, sectionId: string) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.id !== templateId) return t;
        return {
          ...t,
          sections: t.sections.map(s =>
            s.id === sectionId ? { ...s, enabled: !s.enabled } : s
          ),
        };
      })
    );
  };

  const handleSetDefault = (templateId: string) => {
    setTemplates(prev =>
      prev.map(t => ({
        ...t,
        isDefault: t.id === templateId,
      }))
    );
    toast({
      title: 'Default Template Updated',
      description: 'This template will now be used as the default for new reports.',
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'You cannot delete the default template.',
        variant: 'destructive',
      });
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: 'Template Deleted',
      description: 'The template has been removed.',
    });
  };

  const handleCreateTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `template_${Date.now()}`,
      name: 'New Template',
      description: 'A custom report template',
      isDefault: false,
      sections: [
        { id: 'metrics', name: 'Key Metrics', type: 'metrics', enabled: true, order: 0 },
        { id: 'chart', name: 'Performance Chart', type: 'chart', enabled: true, order: 1 },
        { id: 'alerts', name: 'Alerts', type: 'alerts', enabled: false, order: 2 },
      ],
    };
    setTemplates(prev => [...prev, newTemplate]);
    setExpandedTemplate(newTemplate.id);
    toast({
      title: 'Template Created',
      description: 'Customize the sections below.',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Report Templates</CardTitle>
          <CardDescription>Customize what sections appear in your reports</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <Collapsible
            key={template.id}
            open={expandedTemplate === template.id}
            onOpenChange={(open) => setExpandedTemplate(open ? template.id : null)}
          >
            <div className="rounded-lg border border-border overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{template.name}</p>
                        {template.isDefault && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {template.sections.filter(s => s.enabled).length} sections
                    </Badge>
                    {expandedTemplate === template.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border p-4 bg-muted/30 space-y-4">
                  {/* Template Name Edit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input 
                        value={template.name}
                        onChange={(e) => {
                          setTemplates(prev =>
                            prev.map(t =>
                              t.id === template.id ? { ...t, name: e.target.value } : t
                            )
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        value={template.description}
                        onChange={(e) => {
                          setTemplates(prev =>
                            prev.map(t =>
                              t.id === template.id ? { ...t, description: e.target.value } : t
                            )
                          );
                        }}
                      />
                    </div>
                  </div>

                  {/* Sections */}
                  <div>
                    <Label className="mb-3 block">Report Sections</Label>
                    <div className="space-y-2">
                      {template.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                          <div 
                            key={section.id}
                            className="flex items-center justify-between p-3 rounded-md border border-border bg-background"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              <span className="text-lg">{sectionTypeIcons[section.type]}</span>
                              <span className="font-medium">{sectionTypeLabels[section.type]}</span>
                            </div>
                            <Switch
                              checked={section.enabled}
                              onCheckedChange={() => handleToggleSection(template.id, section.id)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      {!template.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(template.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                    </div>
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Template
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
