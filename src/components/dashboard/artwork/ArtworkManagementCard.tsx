import { useState } from 'react';
import { Heart, Eye, MoreVertical, Pin, PinOff, Edit, Trash2, ExternalLink, Globe, Lock, Archive, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { broadcastRefresh } from '@/lib/realtime-sync';

interface ArtworkManagementCardProps {
  artwork: {
    id: string;
    title: string;
    media_url: string;
    category: string;
    price?: number | null;
    status: string;
    created_at: string;
    artist_id?: string;
    metadata?: {
      currency?: string;
      likes_count?: number;
      views_count?: number;
      is_pinned?: boolean;
      [key: string]: any;
    };
  };
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (artwork: any) => void;
  viewMode: 'grid' | 'list';
  pinnedCount?: number;
  isDeleting?: boolean;
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
  isDeleting = false,
}: ArtworkManagementCardProps) => {
  const { toast } = useToast();
  const { format } = useCurrencyFormat();
  
  // Extract values from metadata safely
  const likes = artwork.metadata?.likes_count || 0;
  const views = artwork.metadata?.views_count || 0;
  const isPinned = artwork.metadata?.is_pinned || false;
  const currency = artwork.metadata?.currency || 'USD';
  const accessType: 'free' | 'premium' | 'exclusive' =
    (artwork.metadata?.access_type as 'free' | 'premium' | 'exclusive') || 'free';
  const imageUrl = artwork.media_url;

  const [pendingStatus, setPendingStatus] = useState<'public' | 'private' | 'archived' | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusLabel = (status: string) => {
    if (artwork.metadata?.admin_banned) return 'Banned';
    switch (status) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const handleStatusChange = async (newStatus: 'public' | 'private' | 'archived') => {
    if (artwork.metadata?.admin_banned) {
      toast({
        title: 'Content Blocked',
        description: 'This artwork was removed by a platform administrator and cannot be restored. Reason: ' + (artwork.metadata?.ban_reason || 'Community Guidelines Violation'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('artworks')
        .update({ status: newStatus })
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Artwork is now ${newStatus}.`
      });

      broadcastRefresh('artworks');

      onUpdate({
        ...artwork,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update artwork status.',
        variant: 'destructive'
      });
    }
  };

  const handleTogglePin = async () => {
    try {
      const newPinnedState = !isPinned;
      
      if (newPinnedState && pinnedCount >= 5) {
        toast({
          title: 'Pin Limit Reached',
          description: 'You can only pin up to 5 artworks. Unpin one to pin another.',
          variant: 'destructive'
        });
        return;
      }

      const updatedMetadata = {
        ...(artwork.metadata || {}),
        is_pinned: newPinnedState
      };

      const { error } = await supabase
        .from('artworks')
        .update({ metadata: updatedMetadata })
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: newPinnedState ? 'Artwork Pinned' : 'Artwork Unpinned',
        description: newPinnedState 
          ? `This artwork will appear at the top of your profile.` 
          : 'This artwork has been unpinned.'
      });

      broadcastRefresh('artworks');

      onUpdate({
        ...artwork,
        metadata: updatedMetadata
      });
    } catch (err) {
      console.error('Error toggling pin:', err);
      toast({
        title: 'Error',
        description: 'Failed to update pin status.',
        variant: 'destructive'
      });
    }
  };

  const getStatusConfig = (status: string) => {
    if (artwork.metadata?.admin_banned) {
      return {
        label: 'Banned',
        icon: AlertTriangle,
        className: 'bg-red-600/90 text-white border-red-500/50 shadow-sm shadow-red-500/20'
      };
    }

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

  const getAccessConfig = (type: 'free' | 'premium' | 'exclusive') => {
    switch (type) {
      case 'premium':
        return {
          label: 'Premium',
          className: 'bg-purple-600/90 text-white border-purple-400/50 shadow-sm shadow-purple-500/20'
        };
      case 'exclusive':
        return {
          label: 'Exclusive',
          className: 'bg-fuchsia-600/90 text-white border-fuchsia-400/50 shadow-sm shadow-fuchsia-500/20'
        };
      default:
        return {
          label: 'Free',
          className: 'bg-sky-600/90 text-white border-sky-400/50 shadow-sm shadow-sky-500/20'
        };
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || price === 0 || price <= 0) return 'Free';
    return format(price, currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statusConfig = getStatusConfig(artwork.status);
  const accessConfig = getAccessConfig(accessType);

  if (viewMode === 'list') {
    return (
      <div className={cn(
        'group relative flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl border bg-card transition-all duration-200 overflow-hidden',
        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/30 hover:bg-accent/50'
      )}>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 -ml-2">
            <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(checked as boolean)} className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg shadow-sm border border-border/50">
            <img src={imageUrl} alt={artwork.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
            {isPinned && (
              <div className="absolute top-0.5 left-0.5 rounded-full bg-primary p-0.5 shadow-sm">
                <Pin className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary-foreground fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
            <h4 className="font-semibold text-fluid-xs sm:text-base text-foreground truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none group-hover:text-primary transition-colors leading-tight">
              {artwork.title}
            </h4>
            <Badge
              variant="outline"
              className={cn(
                'text-[8px] sm:text-[10px] px-1 sm:px-1.5 h-3.5 sm:h-4 whitespace-nowrap',
                statusConfig.className
              )}
            >
              {statusConfig.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'text-[8px] sm:text-[10px] px-1 sm:px-1.5 h-3.5 sm:h-4 whitespace-nowrap',
                accessConfig.className
              )}
            >
              {accessConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs text-muted-foreground">
            <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none">{artwork.category}</span>
            <span className="opacity-50">•</span>
            <span className="whitespace-nowrap">{formatDate(artwork.created_at)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-muted-foreground mr-4">
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-help">
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(likes)}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-help">
            <Eye className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(views)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0 ml-auto">
          <div className="font-bold text-foreground text-fluid-xs sm:text-base whitespace-nowrap">
            {formatPrice(artwork.price)}
          </div>
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] text-muted-foreground opacity-70">
            <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" /> {formatNumber(likes)}</span>
            <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {formatNumber(views)}</span>
          </div>
        </div>

        <div className="shrink-0 ml-1 sm:ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 hover:bg-primary/10 hover:text-primary transition-colors">
                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                <Edit className="h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePin} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                {isPinned ? 'Unpin from Profile' : 'Pin to Profile'}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 min-h-[44px] sm:min-h-[40px]">
                  <Globe className="h-4 w-4" /> Visibility
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleStatusChange('public')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Globe className="h-4 w-4" /> Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('private')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Lock className="h-4 w-4" /> Private
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('archived')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Archive className="h-4 w-4" /> Archived
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/artwork/${artwork.id}`} className="gap-2 cursor-pointer min-h-[44px] sm:min-h-[40px]">
                  <ExternalLink className="h-4 w-4" /> View Public Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive min-h-[44px] sm:min-h-[40px]">
                <Trash2 className="h-4 w-4" /> Delete Artwork
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
        'group relative flex flex-col rounded-xl border bg-card transition-all duration-300',
        isSelected ? 'border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10' : 'border-border hover:border-primary/30 hover:shadow-md',
        isDeleting && 'opacity-50 pointer-events-none'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Deletion overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      {/* Selection Checkbox */}
      <div className={cn(
        'absolute top-2 left-2 z-10 transition-opacity duration-200',
        isSelected || isHovered ? 'opacity-100' : 'opacity-0'
      )}>
        <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 bg-background/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <img
          src={imageUrl}
          alt={artwork.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <Badge className={cn('gap-1 px-2 py-1 backdrop-blur-md border border-white/20', statusConfig.className)}>
            <statusConfig.icon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
          {/* Access Type Badge — always show so Premium/Exclusive is visible */}
          <Badge className={cn('gap-1 px-2 py-1 backdrop-blur-md border border-white/20 text-[9px]', accessConfig.className)}>
            {accessConfig.label}
          </Badge>
        </div>

        {/* Pinned Badge */}
        {isPinned && (
          <div className="absolute top-3 left-10">
            <Badge variant="secondary" className="gap-1 px-2 py-1 bg-primary text-primary-foreground border-none">
              <Pin className="h-3 w-3 fill-current" />
              Pinned
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={handleTogglePin}>
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-9 w-9 rounded-full"
            disabled={isDeleting}
            onClick={onDelete}
          >
            {isDeleting
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-fluid-xs sm:text-base text-foreground truncate group-hover:text-primary transition-colors leading-tight">
              {artwork.title}
            </h4>
            <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{artwork.category}</p>
          </div>
          <div className="text-xs sm:text-base font-bold text-primary shrink-0 ml-2">
            {formatPrice(artwork.price)}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
          <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 sm:gap-1.5 hover:text-primary transition-colors cursor-help">
              <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-[9px] sm:text-xs font-medium">{formatNumber(likes)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 hover:text-primary transition-colors cursor-help">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="text-[9px] sm:text-xs font-medium">{formatNumber(views)}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-12 sm:w-12 hover:bg-primary/10 hover:text-primary transition-colors">
                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                <Edit className="h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePin} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                {isPinned ? 'Unpin from Profile' : 'Pin to Profile'}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 min-h-[44px] sm:min-h-[40px]">
                  <Globe className="h-4 w-4" /> Visibility
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleStatusChange('public')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Globe className="h-4 w-4" /> Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('private')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Lock className="h-4 w-4" /> Private
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('archived')} className="gap-2 min-h-[44px] sm:min-h-[40px]">
                      <Archive className="h-4 w-4" /> Archived
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/artwork/${artwork.id}`} className="gap-2 cursor-pointer min-h-[44px] sm:min-h-[40px]">
                  <ExternalLink className="h-4 w-4" /> View Public Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive min-h-[44px] sm:min-h-[40px]">
                <Trash2 className="h-4 w-4" /> Delete Artwork
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ArtworkManagementCard;
