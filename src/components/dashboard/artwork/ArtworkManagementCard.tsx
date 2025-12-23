import { useState } from 'react';
import { Heart, Eye, MoreVertical, Pin, DollarSign, Edit, Trash2, ExternalLink, Globe, Lock, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ArtworkManagementCardProps {
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
    price?: number | null;
    likes: number;
    views: number;
    approval_status: string;
    created_at: string;
    is_pinned?: boolean;
    is_for_sale?: boolean;
  };
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (artwork: any) => void;
  viewMode: 'grid' | 'list';
}

const ArtworkManagementCard = ({
  artwork,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onUpdate,
  viewMode,
}: ArtworkManagementCardProps) => {
  const { toast } = useToast();
  const [pendingStatus, setPendingStatus] = useState<'public' | 'private' | 'archived' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const handleStatusChange = async (newStatus: 'public' | 'private' | 'archived') => {
    try {
      const { error } = await supabase
        .from('artworks')
        .update({ status: newStatus })
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Artwork is now ${newStatus}.`,
      });

      onUpdate({ ...artwork, approval_status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update artwork status.',
        variant: 'destructive',
      });
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      handleStatusChange(pendingStatus);
      setPendingStatus(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'public':
        return { label: 'Public', className: 'bg-primary text-primary-foreground border-primary/40' };
      case 'private':
        return { label: 'Private', className: 'bg-secondary text-secondary-foreground border-border' };
      case 'archived':
        return { label: 'Archived', className: 'bg-muted text-muted-foreground border-border' };
      default:
        return { label: 'Public', className: 'bg-primary text-primary-foreground border-primary/40' };
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || typeof price === 'undefined') return 'Not set';
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statusConfig = getStatusConfig(artwork.approval_status);

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group relative flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200',
          isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/30 hover:bg-accent/50'
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="shrink-0"
        />
        
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="h-full w-full object-cover"
          />
          {artwork.is_pinned && (
            <div className="absolute top-1 left-1 rounded-full bg-primary p-0.5">
              <Pin className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{artwork.title || 'Untitled'}</h3>
            <Badge variant="outline" className={cn('text-xs shrink-0', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{artwork.category || 'Uncategorized'}</span>
            <span className="text-border">•</span>
            <span>{formatDate(artwork.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-400" />
              {formatNumber(artwork.likes)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary/60" />
              {formatNumber(artwork.views)}
            </span>
          </div>

          <div className="text-right min-w-[80px]">
            <span className="font-semibold text-foreground">{formatPrice(artwork.price)}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/artwork/${artwork.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-popover border-border">
                    <DropdownMenuItem 
                      onClick={() => setPendingStatus('public')}
                      className={artwork.approval_status === 'public' ? 'bg-accent' : ''}
                    >
                      <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                      Public
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setPendingStatus('private')}
                      className={artwork.approval_status === 'private' ? 'bg-accent' : ''}
                    >
                      <Lock className="h-4 w-4 mr-2 text-amber-500" />
                      Private
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setPendingStatus('archived')}
                      className={artwork.approval_status === 'archived' ? 'bg-accent' : ''}
                    >
                      <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
                      Archived
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 cursor-pointer',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40 hover:shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(!isSelected)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Top Bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'h-5 w-5 border-2 bg-background/80 backdrop-blur-sm transition-opacity data-[state=checked]:bg-primary data-[state=checked]:border-primary',
              isHovered || isSelected ? 'opacity-100' : 'opacity-0'
            )}
          />
          
          <div className="flex items-center gap-2">
            {artwork.is_pinned && (
              <div className="rounded-full bg-primary/90 backdrop-blur-sm p-1.5">
                <Pin className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <Badge variant="outline" className={cn('backdrop-blur-sm bg-background/80', statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Hover Overlay */}
        <div
          className={cn(
            'absolute inset-0 z-10 bg-gradient-to-t from-background/90 via-background/40 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300',
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button variant="secondary" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <Link to={`/artwork/${artwork.id}`}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/artwork/${artwork.id}`} onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                    <Globe className="h-4 w-4 mr-2" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-popover border-border">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); setPendingStatus('public'); }}
                        className={artwork.approval_status === 'public' ? 'bg-accent' : ''}
                      >
                        <Globe className="h-4 w-4 mr-2 text-emerald-500" />
                        Public
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); setPendingStatus('private'); }}
                        className={artwork.approval_status === 'private' ? 'bg-accent' : ''}
                      >
                        <Lock className="h-4 w-4 mr-2 text-amber-500" />
                        Private
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); setPendingStatus('archived'); }}
                        className={artwork.approval_status === 'archived' ? 'bg-accent' : ''}
                      >
                        <Archive className="h-4 w-4 mr-2 text-muted-foreground" />
                        Archived
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {artwork.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {artwork.category || 'Uncategorized'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              {formatNumber(artwork.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-primary/60" />
              {formatNumber(artwork.views)}
            </span>
          </div>
          
          <span className="font-semibold text-foreground flex items-center gap-1">
            {artwork.is_for_sale && <DollarSign className="h-3.5 w-3.5 text-emerald-500" />}
            {formatPrice(artwork.price)}
          </span>
        </div>
      </div>
      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={!!pendingStatus} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Artwork Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change "{artwork.title}" from <strong>{getStatusLabel(artwork.approval_status)}</strong> to <strong>{pendingStatus ? getStatusLabel(pendingStatus) : ''}</strong>?
              {pendingStatus === 'private' && (
                <span className="block mt-2 text-amber-500">This will hide the artwork from public view.</span>
              )}
              {pendingStatus === 'archived' && (
                <span className="block mt-2 text-muted-foreground">Archived artworks won't appear in your public profile.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArtworkManagementCard;
