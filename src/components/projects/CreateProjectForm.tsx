import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Upload, X, FileText, AlertTriangle, Check, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface MilestoneInput {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  amount: number;
  due_date: string;
}

interface ReferenceFile {
  file: File;
  preview: string;
}

interface CreateProjectFormProps {
  artistId?: string;
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

export function CreateProjectForm({ artistId, onSuccess, onCancel }: CreateProjectFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Project fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [deadline, setDeadline] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([]);

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: crypto.randomUUID(), title: '', description: '', deliverables: '', amount: 0, due_date: '' }
  ]);

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const budgetMatches = totalMilestoneAmount === budget;

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: crypto.randomUUID(), title: '', description: '', deliverables: '', amount: 0, due_date: '' }
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setMilestones(items);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setReferenceFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setReferenceFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (budget <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    if (!budgetMatches) {
      toast.error('Milestone amounts must equal the total budget');
      return;
    }

    const emptyMilestones = milestones.filter(m => !m.title.trim() || m.amount <= 0);
    if (emptyMilestones.length > 0) {
      toast.error('All milestones must have a title and amount');
      return;
    }

    setSubmitting(true);

    try {
      // Upload reference files
      const uploadedFiles: string[] = [];
      for (const { file } of referenceFiles) {
        const filePath = `${user?.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath);

        uploadedFiles.push(publicUrl);
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          budget,
          deadline: deadline || null,
          client_id: user?.id,
          artist_id: artistId,
          status: 'pending',
          is_locked: false,
          reference_files: uploadedFiles
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create milestones
      const milestonesData = milestones.map((m, index) => ({
        project_id: project.id,
        title: m.title,
        description: m.description || null,
        deliverables: m.deliverables || null,
        amount: m.amount,
        due_date: m.due_date || null,
        sort_order: index,
        status: 'pending',
        created_by: user?.id
      }));

      const { error: milestonesError } = await supabase
        .from('project_milestones')
        .insert(milestonesData);

      if (milestonesError) throw milestonesError;

      // Create notification for artist
      await supabase.from('notifications').insert({
        user_id: artistId,
        title: 'New Project Request',
        message: `You have received a new project request: "${title}"`,
        type: 'project',
        metadata: { projectId: project.id }
      });

      toast.success('Project created successfully! Waiting for artist approval.');
      onSuccess?.(project.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Define your project details and break it down into milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Project Details</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Logo Design for Company X"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($) *</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                placeholder="e.g., 1000"
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project requirements, goals, and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Project Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Reference Files */}
          <div className="space-y-2">
            <Label>Reference Files (Optional)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload reference images, documents, or examples
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.zip"
            />
            
            {referenceFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {referenceFiles.map((rf, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[150px]">{rf.file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Milestones</h3>
            <Button variant="outline" size="sm" onClick={addMilestone}>
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </Button>
          </div>

          {/* Budget Validation */}
          {budget > 0 && (
            <Alert className={budgetMatches ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10'}>
              {budgetMatches ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription className={budgetMatches ? 'text-emerald-600' : 'text-destructive'}>
                Milestone total: ${totalMilestoneAmount.toLocaleString()} / Budget: ${budget.toLocaleString()}
                {!budgetMatches && ' — Please adjust milestone amounts to match the budget.'}
              </AlertDescription>
            </Alert>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="milestones">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-4 bg-card"
                        >
                          <div className="flex items-start gap-3">
                            <div {...provided.dragHandleProps} className="mt-2 cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Milestone {index + 1}
                                </span>
                                {milestones.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-auto"
                                    onClick={() => removeMilestone(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Title *</Label>
                                  <Input
                                    placeholder="e.g., Initial Concepts"
                                    value={milestone.title}
                                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Amount ($) *</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={milestone.amount || ''}
                                    onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                  placeholder="Describe what will be delivered in this milestone..."
                                  value={milestone.description}
                                  onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                  rows={2}
                                />
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Deliverables</Label>
                                  <Input
                                    placeholder="e.g., 3 logo concepts"
                                    value={milestone.deliverables}
                                    onChange={(e) => updateMilestone(index, 'deliverables', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Due Date</Label>
                                  <Input
                                    type="date"
                                    value={milestone.due_date}
                                    onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || !budgetMatches || !title.trim() || budget <= 0}
          >
            {submitting ? 'Creating...' : 'Create Project Request'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
