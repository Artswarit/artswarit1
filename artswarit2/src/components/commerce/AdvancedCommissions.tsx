
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, DollarSign, FileText, MessageSquare, Shield, CheckCircle } from 'lucide-react';

interface Commission {
  id: string;
  title: string;
  client: string;
  artist: string;
  type: 'music' | 'art' | 'video' | 'writing';
  status: 'pending' | 'accepted' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  description: string;
  milestones: Milestone[];
  escrowStatus: 'pending' | 'funded' | 'released' | 'disputed';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved' | 'revision_requested';
}

const AdvancedCommissions = () => {
  const [commissions] = useState<Commission[]>([
    {
      id: '1',
      title: 'Custom Album Cover Design',
      client: 'Indie Records',
      artist: 'Maya Johnson',
      type: 'art',
      status: 'in_progress',
      budget: 500,
      deadline: '2024-02-15',
      description: 'Need a psychedelic album cover for our new release',
      escrowStatus: 'funded',
      milestones: [
        {
          id: '1',
          title: 'Initial Concept',
          description: 'First draft and mood board',
          amount: 150,
          dueDate: '2024-01-20',
          status: 'approved'
        },
        {
          id: '2',
          title: 'Refined Design',
          description: 'Detailed artwork with revisions',
          amount: 250,
          dueDate: '2024-02-05',
          status: 'submitted'
        },
        {
          id: '3',
          title: 'Final Delivery',
          description: 'High-res files and variations',
          amount: 100,
          dueDate: '2024-02-15',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      title: 'Wedding Song Composition',
      client: 'Sarah & Tom',
      artist: 'Alex Rivera',
      type: 'music',
      status: 'pending',
      budget: 800,
      deadline: '2024-03-10',
      description: 'Original song for wedding ceremony',
      escrowStatus: 'pending',
      milestones: [
        {
          id: '4',
          title: 'Lyrics & Melody',
          description: 'Basic composition',
          amount: 300,
          dueDate: '2024-02-20',
          status: 'pending'
        },
        {
          id: '5',
          title: 'Full Arrangement',
          description: 'Complete instrumental',
          amount: 350,
          dueDate: '2024-03-01',
          status: 'pending'
        },
        {
          id: '6',
          title: 'Final Recording',
          description: 'Professional recording',
          amount: 150,
          dueDate: '2024-03-10',
          status: 'pending'
        }
      ]
    }
  ]);

  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showNewCommissionForm, setShowNewCommissionForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'funded': return 'bg-green-100 text-green-800';
      case 'released': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Commissions</h2>
          <p className="text-muted-foreground">Manage custom artwork requests with milestone-based payments</p>
        </div>
        <Button onClick={() => setShowNewCommissionForm(true)}>
          Create Commission Request
        </Button>
      </div>

      {/* Commission List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {commissions.map((commission) => (
          <Card key={commission.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCommission(commission)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{commission.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {commission.client} → {commission.artist}
                  </p>
                </div>
                <Badge className={getStatusColor(commission.status)}>
                  {commission.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">{commission.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>${commission.budget}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{commission.deadline}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge className={getEscrowStatusColor(commission.escrowStatus)}>
                    <Shield className="h-3 w-3 mr-1" />
                    Escrow: {commission.escrowStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {commission.milestones.length} milestones
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Details Modal */}
      {selectedCommission && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedCommission.title}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedCommission(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Budget</label>
                <p className="text-xl font-bold">${selectedCommission.budget}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                <p className="font-medium">{selectedCommission.deadline}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Escrow Status</label>
                <Badge className={getEscrowStatusColor(selectedCommission.escrowStatus)}>
                  {selectedCommission.escrowStatus}
                </Badge>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
              <div className="space-y-4">
                {selectedCommission.milestones.map((milestone, index) => (
                  <Card key={milestone.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <Badge className={getMilestoneStatusColor(milestone.status)}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${milestone.amount}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Due: {milestone.dueDate}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {milestone.status === 'submitted' && (
                            <>
                              <Button size="sm" variant="outline">
                                Request Revision
                              </Button>
                              <Button size="sm">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                            </>
                          )}
                          {milestone.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              Submit Work
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Communication */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Communication</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Project Messages</span>
                  </div>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <span className="font-medium">Client:</span> Looking forward to seeing the initial concepts!
                    </div>
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <span className="font-medium">Artist:</span> I've uploaded the mood board for review.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="sm">Send</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Commission Form */}
      {showNewCommissionForm && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Commission Request</CardTitle>
              <Button variant="outline" onClick={() => setShowNewCommissionForm(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Commission title" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="art">Visual Art</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea placeholder="Describe your project requirements..." rows={4} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="number" placeholder="Budget ($)" />
              <Input type="date" placeholder="Deadline" />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button>Submit Request</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedCommissions;
