import { useState } from 'react';
import { Heart, Eye, MoreVertical, Pin, PinOff, Edit, Trash2, ExternalLink, Globe, Lock, Archive, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

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

  const likes = artwork.metadata?.likes_count || 0;
  const views = artwork.metadata?.views_count || 0;
  const isPinned = artwork.metadata?.is_pinned || false;
  const currency = artwork.metadata?.currency || 'USD';
  const accessType: 'free' | 'premium' | 'exclusive' =
    (artwork.metadata?.access_type as 'free' | 'premium' | 'exclusive') || 'free';
  const imageUrl = artwork.media_url;

  const [isHovered, setIsHovered] = useState(false);

  const handleStatusChange = async (newStatus: 'public' | 'private' | 'archived') => {
    if (artwork.metadata?.admin_banned) {
      toast({
        title: 'Content Blocked',
        description: 'This artwork was removed by an administrator. Reason: ' + (artwork.metadata?.ban_reason || 'Community Guidelines Violation'),
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
      toast({ title: 'Status Updated', description: `Artwork is now ${newStatus}.` });
      onUpdate({ ...artwork, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update artwork status.', variant: 'destructive' });
    }
  };

  const handleTogglePin = async () => {
    try {
      const newPinnedState = !isPinned;
      if (newPinnedState && pinnedCount >= 5) {
        toast({ title: 'Pin Limit Reached', description: 'You can only pin up to 5 artworks.', variant: 'destructive' });
        return;
      }
      const updatedMetadata = { ...(artwork.metadata || {}), is_pinned: newPinnedState };
      const { error } = await supabase
        .from('artworks')
        .update({ metadata: updatedMetadata })
        .eq('id', artwork.id);
      if (error) throw error;
      toast({
        title: newPinnedState ? 'Artwork Pinned' : 'Artwork Unpinned',
        description: newPinnedState ? 'This artwork will appear at the top of your profile.' : 'This artwork has been unpinned.'
      });
      onUpdate({ ...artwork, metadata: updatedMetadata });
    } catch (err) {
      console.error('Error toggling pin:', err);
      toast({ title: 'Error', description: 'Failed to update pin status.', variant: 'destructive' });
    }
  };

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined || price === 0 || price <= 0) return null;
    return format(price, currency);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Unified status badge config
  const statusBadge = (() => {
    if (artwork.metadata?.admin_banned) {
      return { label: 'Banned', icon: AlertTriangle, bg: 'bg-destructive/10 text-destructive border-destructive/20' };
    }
    switch (artwork.status) {
      case 'public': return { label: 'Public', icon: Globe, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'private': return { label: 'Private', icon: Lock, bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'archived': return { label: 'Archived', icon: Archive, bg: 'bg-muted text-muted-foreground border-border' };
      default: return { label: 'Public', icon: Globe, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
  })();

  const accessBadge = (() => {
    switch (accessType) {
      case 'premium': return { label: 'Premium', icon: Crown, bg: 'bg-primary/10 text-primary border-primary/20' };
      case 'exclusive': return { label: 'Exclusive', icon: Sparkles, bg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20' };
      default: return null;
    }
  })();

  const ContextMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-border/50">
        <DropdownMenuItem onClick={onEdit} className="gap-2.5 py-2.5 cursor-pointer">
          <Edit className="h-4 w-4 text-muted-foreground" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTogglePin} className="gap-2.5 py-2.5 cursor-pointer">
          {isPinned ? <PinOff className="h-4 w-4 text-muted-foreground" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
          {isPinned ? 'Unpin' : 'Pin to Profile'}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2.5 py-2.5">
            <Globe className="h-4 w-4 text-muted-foreground" /> Visibility
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-xl">
              <DropdownMenuItem onClick={() => handleStatusChange('public')} className="gap-2.5 py-2.5 cursor-pointer">
                <Globe className="h-4 w-4 text-emerald-500" /> Public
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('private')} className="gap-2.5 py-2.5 cursor-pointer">
                <Lock className="h-4 w-4 text-amber-500" /> Private
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('archived')} className="gap-2.5 py-2.5 cursor-pointer">
                <Archive className="h-4 w-4 text-muted-foreground" /> Archived
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/artwork/${artwork.id}`} className="gap-2.5 py-2.5 cursor-pointer">
            <ExternalLink className="h-4 w-4 text-muted-foreground" /> View Public Page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="gap-2.5 py-2.5 text-destructive focus:text-destructive cursor-pointer">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ─── LIST VIEW ────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className={cn(
        'group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border bg-card/80 backdrop-blur-sm transition-all duration-200',
        isSelected
          ? 'border-primary/40 bg-primary/[0.03] ring-1 ring-primary/10'
          : 'border-border/60 hover:border-border hover:bg-card hover:shadow-sm'
      )}>
        {/* Checkbox */}
        <div className="shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            className="h-[18px] w-[18px] rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        {/* Thumbnail */}
        <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-border/40">
          <img src={imageUrl} alt={artwork.title} className="h-full w-full object-cover" />
          {isPinned && (
            <div className="absolute -top-0.5 -right-0.5 rounded-full bg-primary p-[3px] shadow-sm">
              <Pin className="h-2 w-2 text-primary-foreground fill-current" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {artwork.title}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{artwork.category}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(artwork.created_at)}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={cn('text-[10px] font-medium px-2 py-0.5 rounded-lg border gap-1', statusBadge.bg)}>
            <statusBadge.icon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
          {accessBadge && (
            <Badge variant="outline" className={cn('text-[10px] font-medium px-2 py-0.5 rounded-lg border gap-1', accessBadge.bg)}>
              <accessBadge.icon className="h-3 w-3" />
              {accessBadge.label}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-3 text-muted-foreground shrink-0">
          <span className="flex items-center gap-1 text-xs">
            <Heart className="h-3.5 w-3.5" /> {formatNumber(likes)}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Eye className="h-3.5 w-3.5" /> {formatNumber(views)}
          </span>
        </div>

        {/* Mobile stats */}
        <div className="flex sm:hidden flex-col items-end gap-0.5 shrink-0">
          <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4 rounded-md border gap-0.5', statusBadge.bg)}>
            <statusBadge.icon className="h-2.5 w-2.5" />
            {statusBadge.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{formatNumber(likes)}</span>
            <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{formatNumber(views)}</span>
          </div>
        </div>

        {/* Menu */}
        <div className="shrink-0">
          <ContextMenu />
        </div>
      </div>
    );
  }

  // ─── GRID VIEW ────────────────────────────────────────
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl bg-card border transition-all duration-300 overflow-hidden',
        isSelected
          ? 'border-primary/40 ring-2 ring-primary/10 shadow-lg shadow-primary/5'
          : 'border-border/50 hover:border-border hover:shadow-lg hover:shadow-black/5',
        isDeleting && 'opacity-50 pointer-events-none'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Deletion overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={artwork.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Gradient overlay - always visible for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-left: Checkbox */}
        <div className={cn(
          'absolute top-3 left-3 z-10 transition-all duration-200',
          isSelected || isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
        )}>
          <div className="flex items-center justify-center h-8 w-8 bg-background/90 backdrop-blur-md rounded-lg border border-border/30 shadow-sm">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(checked as boolean)}
              className="h-4 w-4 rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        </div>

        {/* Top-right: Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
          <Badge className={cn(
            'gap-1 px-2 py-0.5 text-[10px] font-medium rounded-lg border backdrop-blur-md shadow-sm',
            statusBadge.bg, 'bg-background/80 dark:bg-background/60'
          )}>
            <statusBadge.icon className="h-3 w-3" />
            {statusBadge.label}
          </Badge>
          {accessBadge && (
            <Badge className={cn(
              'gap-1 px-2 py-0.5 text-[10px] font-medium rounded-lg border backdrop-blur-md shadow-sm',
              accessBadge.bg, 'bg-background/80 dark:bg-background/60'
            )}>
              <accessBadge.icon className="h-3 w-3" />
              {accessBadge.label}
            </Badge>
          )}
        </div>

        {/* Pinned indicator */}
        {isPinned && (
          <div className="absolute top-3 left-14 z-10">
            <Badge className="gap-1 px-2 py-0.5 text-[10px] font-medium rounded-lg bg-primary/90 text-primary-foreground border-none backdrop-blur-md shadow-sm">
              <Pin className="h-3 w-3 fill-current" />
              Pinned
            </Badge>
          </div>
        )}

        {/* Hover actions */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300',
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl bg-background/90 backdrop-blur-md text-foreground hover:bg-background shadow-lg border border-border/30 transition-transform hover:scale-105"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl bg-background/90 backdrop-blur-md text-foreground hover:bg-background shadow-lg border border-border/30 transition-transform hover:scale-105"
            onClick={handleTogglePin}
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl bg-destructive/90 backdrop-blur-md text-destructive-foreground hover:bg-destructive shadow-lg border-none transition-transform hover:scale-105"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content footer */}
      <div className="flex flex-col p-3 sm:p-4 gap-2">
        {/* Title + Category */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-[15px] text-foreground truncate leading-snug">
              {artwork.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{artwork.category}</p>
          </div>
          {/* Price for premium */}
          {accessType === 'premium' && formatPrice(artwork.price) && (
            <span className="text-sm font-bold text-primary shrink-0">
              {formatPrice(artwork.price)}
            </span>
          )}
        </div>

        {/* Stats + Menu */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors">
              <Heart className="h-3.5 w-3.5" /> {formatNumber(likes)}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" /> {formatNumber(views)}
            </span>
          </div>
          <ContextMenu />
        </div>
      </div>
    </div>
  );
};

export default ArtworkManagementCard;
