import { useState } from 'react';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ban, UserCheck, Loader2 } from 'lucide-react';

interface BlockUserButtonProps {
  userId: string;
  userName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

const BlockUserButton = ({
  userId,
  userName,
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
}: BlockUserButtonProps) => {
  const { user } = useAuth();
  const { isUserBlocked, blockUser, unblockUser, loading } = useBlockedUsers();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const isBlocked = isUserBlocked(userId);
  const isOwnAccount = user?.id === userId;

  if (isOwnAccount) return null;

  const handleAction = async () => {
    setProcessing(true);
    
    if (isBlocked) {
      await unblockUser(userId);
    } else {
      await blockUser(userId, reason.trim() || undefined);
    }
    
    setProcessing(false);
    setShowConfirmDialog(false);
    setReason('');
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={isBlocked ? 'outline' : 'destructive'}
        size={size}
        className={className}
        onClick={() => setShowConfirmDialog(true)}
      >
        {isBlocked ? (
          <>
            <UserCheck className="h-4 w-4" />
            {showLabel && <span className="ml-2">Unblock</span>}
          </>
        ) : (
          <>
            <Ban className="h-4 w-4" />
            {showLabel && <span className="ml-2">Block</span>}
          </>
        )}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBlocked ? 'Unblock User' : 'Block User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isBlocked ? (
                <>
                  Are you sure you want to unblock {userName || 'this user'}? 
                  You will be able to see their content and receive messages from them again.
                </>
              ) : (
                <>
                  Are you sure you want to block {userName || 'this user'}?
                  <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                    <li>You won't see their artworks in your feed</li>
                    <li>They won't be able to message you</li>
                    <li>Your existing conversations will be hidden</li>
                    <li>They won't be notified of being blocked</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isBlocked && (
            <div className="space-y-2 py-2">
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Textarea
                id="block-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you blocking this user? This is for your reference only."
                rows={2}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={processing}
              className={!isBlocked ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isBlocked ? 'Unblock' : 'Block User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BlockUserButton;
