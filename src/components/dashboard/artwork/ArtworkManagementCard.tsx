import { useState } from 'react';
import { Heart, Eye, MoreVertical, Pin, PinOff, DollarSign, Edit, Trash2, ExternalLink, Globe, Lock, Archive } from 'lucide-react';
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
    artist_id?: string;
  };
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (artwork: any) => void;
  viewMode: 'grid' | 'list';
  pinnedCount?: number;
}

const ArtworkManagementCard = ({
  artwork,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onUpdate,
  viewMode,
  pinnedCount = 0,
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

  const handleTogglePin = async () => {
    try {
      const newPinnedState = !artwork.is_pinned;
      
      // If trying to pin, check the limit first
      if (newPinnedState && pinnedCount >= 5) {
        toast({
          title: 'Pin Limit Reached',
          description: 'You can only pin up to 5 artworks. Unpin one to pin another.',
          variant: 'destructive',
        });
        return;
      }

      // Get current metadata
      const { data: currentArtwork, error: fetchError } = await supabase
        .from('artworks')
        .select('metadata')
        .eq('id', artwork.id)
        .single();

      if (fetchError) throw fetchError;

      const currentMetadata = (currentArtwork?.metadata as Record<string, unknown>) || {};
      
      const { error } = await supabase
        .from('artworks')
        .update({ 
          metadata: { 
            ...currentMetadata, 
            is_pinned: newPinnedState 
          } 
        })
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: newPinnedState ? 'Artwork Pinned' : 'Artwork Unpinned',
        description: newPinnedState 
          ? `This artwork will appear at the top of your profile. (${pinnedCount + 1}/5 pinned)` 
          : 'This artwork has been unpinned.',
      });

      onUpdate({ ...artwork, is_pinned: newPinnedState });
    } catch (err) {
      console.error('Error toggling pin:', err);
      toast({
        title: 'Error',
        description: 'Failed to update pin status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'public':
        return { 
          label: 'Public', 
          icon: Globe,
          className: 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-sm shadow-emerald-500/20' 
        };
      case 'private':
        return { 
          label: 'Private', 
          icon: Lock,
          className: 'bg-amber-500/90 text-white border-amber-400/50 shadow-sm shadow-amber-500/20' 
        };
      case 'archived':
        return { 
          label: 'Archived', 
          icon: Archive,
          className: 'bg-slate-500/90 text-white border-slate-400/50 shadow-sm shadow-slate-500/20' 
        };
      default:
        return { 
          label: 'Public', 
          icon: Globe,
          className: 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-sm shadow-emerald-500/20' 
        };
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || price === 0 || price <= 0) return 'Free';
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
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs shrink-0 flex items-center gap-1 px-2 py-0.5 transition-all duration-200 hover:scale-105 hover:brightness-110 cursor-default',
                statusConfig.className
              )}
            >
              <statusConfig.icon className="h-3 w-3" />
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
              <DropdownMenuItem onClick={handleTogglePin}>
                {artwork.is_pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin from Profile
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin to Profile
                  </>
                )}
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
        'group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 cursor-pointer',
        'shadow-sm hover:shadow-xl hover:shadow-primary/5',
        isSelected 
          ? 'border-primary ring-2 ring-primary/30 scale-[0.98]' 
          : 'border-border/50 hover:border-primary/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(!isSelected)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className={cn(
            'h-full w-full object-cover transition-all duration-500',
            isHovered ? 'scale-110 brightness-90' : 'scale-100'
          )}
        />
        
        {/* Subtle gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
        
        {/* Top Bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3">
          <div
            className={cn(
              'transition-all duration-300 transform',
              isHovered || isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            )}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 border-2 bg-white/90 backdrop-blur-md shadow-lg transition-all data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {artwork.is_pinned && (
              <div className="rounded-full bg-gradient-to-br from-primary to-primary/80 backdrop-blur-md p-1.5 shadow-lg shadow-primary/30 animate-in fade-in zoom-in duration-300">
                <Pin className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            )}
            <Badge 
              variant="outline" 
              className={cn(
                'backdrop-blur-md px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border shadow-lg transition-all duration-200 hover:scale-105',
                statusConfig.className
              )}
            >
              <statusConfig.icon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Hover Overlay with Actions */}
        <div
          className={cn(
            'absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 transition-all duration-300',
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div className="flex items-center gap-2 transform transition-all duration-300" style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)' }}>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/95 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white/95 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
              asChild 
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/artwork/${artwork.id}`}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/95 hover:bg-white text-foreground shadow-lg backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-md border-border shadow-xl">
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTogglePin(); }}>
                  {artwork.is_pinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin from Profile
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin to Profile
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                    <Globe className="h-4 w-4 mr-2" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-md border-border shadow-xl">
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
          <h3 className="font-semibold text-foreground truncate text-base group-hover:text-primary transition-colors duration-200">
            {artwork.title || 'Untitled'}
          </h3>
          <p className="text-sm text-muted-foreground/80 truncate mt-1">
            {artwork.category || 'image'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-500 transition-colors">
              <Heart className="h-4 w-4 text-rose-400/80" />
              <span className="font-medium">{formatNumber(artwork.likes)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
              <Eye className="h-4 w-4 text-primary/50" />
              <span className="font-medium">{formatNumber(artwork.views)}</span>
            </span>
          </div>
          
          <span className={cn(
            'font-bold text-sm flex items-center gap-1 px-2.5 py-1 rounded-full',
            artwork.price && artwork.price > 0 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-muted text-muted-foreground'
          )}>
            {artwork.price && artwork.price > 0 && <DollarSign className="h-3.5 w-3.5" />}
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
