import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Plus, Ban, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Warning {
  id: string;
  user_id: string;
  type: string;
  reason: string;
  issued_by: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const WARNING_TYPES = [
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'suspension', label: 'Temporary Suspension', icon: Clock, color: 'text-orange-500' },
  { value: 'ban', label: 'Permanent Ban', icon: Ban, color: 'text-red-500' }
];

export function UserWarningsManagement() {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [userId, setUserId] = useState('');
  const [warningType, setWarningType] = useState('');
  const [reason, setReason] = useState('');
  const [expiresIn, setExpiresIn] = useState('');

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_warnings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWarnings(data || []);
    } catch (error: any) {
      toast.error('Failed to load warnings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueWarning = async () => {
    if (!userId || !warningType || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      let expiresAt = null;
      if (expiresIn && warningType === 'suspension') {
        const days = parseInt(expiresIn);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }

      const { error } = await supabase
        .from('user_warnings')
        .insert({
          user_id: userId,
          type: warningType,
          reason,
          issued_by: user?.id,
          expires_at: expiresAt,
          is_active: true
        });

      if (error) throw error;

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: warningType === 'ban' ? 'Account Banned' : 'Account Warning',
        message: reason,
        type: 'warning',
        metadata: { warningType }
      });

      toast.success('Warning issued successfully');
      fetchWarnings();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to issue warning');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeactivateWarning = async (warningId: string) => {
    try {
      const { error } = await supabase
        .from('user_warnings')
        .update({ is_active: false })
        .eq('id', warningId);

      if (error) throw error;

      toast.success('Warning deactivated');
      fetchWarnings();
    } catch (error: any) {
      toast.error('Failed to deactivate warning');
    }
  };

  const resetForm = () => {
    setUserId('');
    setWarningType('');
    setReason('');
    setExpiresIn('');
  };

  const getTypeBadge = (type: string, isActive: boolean) => {
    const config = WARNING_TYPES.find(t => t.value === type) || WARNING_TYPES[0];
    const Icon = config.icon;
    
    return (
      <Badge className={`gap-1 ${!isActive ? 'opacity-50' : ''} ${
        type === 'ban' ? 'bg-red-500/20 text-red-600' :
        type === 'suspension' ? 'bg-orange-500/20 text-orange-600' :
        'bg-yellow-500/20 text-yellow-600'
      }`}>
        <Icon className="h-3 w-3" />
        {config.label}
        {!isActive && ' (Inactive)'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeWarnings = warnings.filter(w => w.is_active);
  const inactiveWarnings = warnings.filter(w => !w.is_active);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                User Warnings & Penalties
              </CardTitle>
              <CardDescription>
                Manage warnings, suspensions, and bans for users
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Issue Warning
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {warnings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No warnings issued yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warnings.map((warning) => (
                  <TableRow key={warning.id} className={!warning.is_active ? 'opacity-60' : ''}>
                    <TableCell className="font-mono text-xs">
                      {warning.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{getTypeBadge(warning.type, warning.is_active)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{warning.reason}</TableCell>
                    <TableCell>
                      {warning.expires_at 
                        ? format(new Date(warning.expires_at), 'MMM d, yyyy')
                        : warning.type === 'ban' ? 'Never' : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {format(new Date(warning.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {warning.is_active && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeactivateWarning(warning.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Issue Warning Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Warning</DialogTitle>
            <DialogDescription>
              Issue a warning, suspension, or ban to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                placeholder="Enter user UUID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Warning Type *</Label>
              <Select value={warningType} onValueChange={setWarningType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {WARNING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {warningType === 'suspension' && (
              <div className="space-y-2">
                <Label htmlFor="expiresIn">Suspension Duration (days)</Label>
                <Input
                  id="expiresIn"
                  type="number"
                  min="1"
                  placeholder="e.g., 7"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={warningType === 'ban' ? 'destructive' : 'default'}
              onClick={handleIssueWarning}
              disabled={processing || !userId || !warningType || !reason}
            >
              {processing ? 'Issuing...' : 'Issue Warning'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
