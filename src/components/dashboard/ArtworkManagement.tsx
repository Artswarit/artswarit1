import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useArtworks } from '@/hooks/useArtworks';
import { useAuth } from '@/contexts/AuthContext';
import { useArtistPlan } from '@/hooks/useArtistPlan';
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import { Grid3X3, List, Plus, BarChart3, ImagePlus, FolderOpen, Pin, Lock, Crown } from 'lucide-react';
import ArtworkUploadForm from './artwork/ArtworkUploadForm';
import ArtworkEditModal from './artwork/ArtworkEditModal';
import ArtworkSearchFilters from './artwork/ArtworkSearchFilters';
import ArtworkBulkActions from './artwork/ArtworkBulkActions';
import ArtworkAnalytics from './artwork/ArtworkAnalytics';
import ArtworkManagementCard from './artwork/ArtworkManagementCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

const ArtworkManagement = () => {
  const { user } = useAuth();
  const { artworks, loading, error: fetchError, fetchArtworks } = useArtworks();
  const { toast } = useToast();
  const { isProArtist, portfolioLimit, loading: gatingLoading, refresh: refreshGating } = useFeatureGating(user?.id);
  const { analytics, loading: analyticsLoading } = useRealAnalytics();
  
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all',
    tags: [] as string[],
    sortBy: 'newest',
  });

  // Handle upload button click with premium gating
  const handleUploadClick = () => {
    if (!isProArtist && artworks.length >= portfolioLimit) {
      setShowUpgradePrompt(true);
    } else {
      setShowUploadForm(true);
    }
  };

  // Handle analytics button click with premium gating
  const handleAnalyticsClick = () => {
    if (!isProArtist) {
      setShowUpgradePrompt(true);
    } else {
      setShowAnalytics(!showAnalytics);
    }
  };

  const filteredArtworks = useMemo(() => {
    let filtered = [...artworks];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (artwork) =>
          (artwork.title?.toLowerCase().includes(searchTerm)) ||
          (artwork.description?.toLowerCase().includes(searchTerm)) ||
          (artwork.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm)))
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((artwork) => artwork.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((artwork) => artwork.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((artwork) => artwork.media_type === filters.type);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((artwork) =>
        artwork.tags?.some((tag: string) => filters.tags.includes(tag))
      );
    }

    // Apply sorting based on filter
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most_liked':
        filtered.sort((a, b) => (b.metadata?.likes_count || 0) - (a.metadata?.likes_count || 0));
        break;
      case 'most_viewed':
        filtered.sort((a, b) => (b.metadata?.views_count || 0) - (a.metadata?.views_count || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Always sort pinned artworks first
    filtered.sort((a, b) => {
      const aPinned = a.metadata?.is_pinned || false;
      const bPinned = b.metadata?.is_pinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    return filtered;
  }, [artworks, filters]);

  // Count pinned artworks
  const pinnedCount = useMemo(() => {
    return artworks.filter((artwork) => artwork.metadata?.is_pinned).length;
  }, [artworks]);

  const handleSelectArtwork = (artworkId: string, checked: boolean) => {
    if (checked) {
      setSelectedArtworks([...selectedArtworks, artworkId]);
    } else {
      setSelectedArtworks(selectedArtworks.filter((id) => id !== artworkId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArtworks(filteredArtworks.map((artwork) => artwork.id));
    } else {
      setSelectedArtworks([]);
    }
  };

  const handleBulkAction = async (action: string, options?: any) => {
    if (selectedArtworks.length === 0) return;
    if (bulkLoading) return;
    setBulkLoading(true);
    try {
      switch (action) {
        case 'delete': {
          // Parallel delete — previously this was a serial for-loop (N×RTT)
          await Promise.all(
            selectedArtworks.map(artworkId =>
              supabase.functions.invoke('delete-artwork-and-media', { body: { artworkId } })
                .then(({ error }) => { if (error) throw error; })
            )
          );
          toast({
            title: 'Artworks Deleted',
            description: `${selectedArtworks.length} artwork(s) have been deleted.`,
          });
          setSelectedArtworks([]);
          fetchArtworks();
          break;
        }
        case 'changeStatus': {
          const { error } = await supabase
            .from('artworks')
            .update({ status: options.status })
            .in('id', selectedArtworks);
          if (error) throw error;
          toast({
            title: 'Status Updated',
            description: `${selectedArtworks.length} artwork(s) status changed to ${options.status}.`,
          });
          fetchArtworks();
          break;
        }
        case 'archive': {
          const { error } = await supabase
            .from('artworks')
            .update({ status: 'archived' })
            .in('id', selectedArtworks);
          if (error) throw error;
          toast({
            title: 'Artworks Archived',
            description: `${selectedArtworks.length} artwork(s) have been archived.`,
          });
          setSelectedArtworks([]);
          fetchArtworks();
          break;
        }
        case 'export': {
          const exportData = artworks.filter(a => selectedArtworks.includes(a.id));
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `artworks-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast({
            title: 'Export Complete',
            description: `${selectedArtworks.length} artwork(s) exported.`,
          });
          break;
        }
      }
    } catch (err: any) {
      const detail = err?.message?.includes('not found') ? 'One or more artworks were not found.'
        : err?.message?.includes('unauthorized') || err?.status === 401 ? 'Permission denied — you can only edit your own artworks.'
        : err?.message || 'Bulk action failed';
      toast({ title: 'Error', description: detail, variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleArtworkUpdate = (updatedArtwork: any) => {
    fetchArtworks(); // Refresh the list
    toast({
      title: 'Artwork Updated',
      description: 'Your artwork has been updated successfully.',
    });
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (deletingId) return; // Prevent double-delete
    setDeletingId(artworkId);
    try {
      const { data, error } = await supabase.functions.invoke('delete-artwork-and-media', {
        body: { artworkId }
      });

      if (error) throw error;

      toast({
        title: 'Artwork Deleted',
        description: 'Your artwork has been deleted successfully.',
      });
      fetchArtworks();
      refreshGating();
    } catch (err: any) {
      const detail = err?.message?.includes('not found') ? 'Artwork not found or already deleted.'
        : err?.message?.includes('unauthorized') ? 'Permission denied — you can only delete your own artworks.'
        : err?.message || 'Failed to delete artwork.';
      toast({ title: 'Error', description: detail, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your artworks...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-semibold">Error Loading Artworks</h2>
          <p className="text-muted-foreground">{fetchError}</p>
          <Button onClick={() => fetchArtworks()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 py-2 sm:py-6">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-muted/20 sm:bg-transparent p-5 sm:p-0 rounded-[2rem] sm:rounded-none border border-border/40 sm:border-none shadow-sm sm:shadow-none animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-[1.1]">
            Artwork <span className="text-primary">Management</span>
          </h2>
          <p className="text-[11px] sm:text-sm lg:text-base text-muted-foreground font-medium opacity-80 leading-relaxed">
            Curate and optimize your digital portfolio for maximum impact
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant={showAnalytics ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleAnalyticsClick}
            className={cn(
              "flex-1 sm:flex-none gap-2 h-10 sm:h-12 px-4 sm:px-6 rounded-2xl font-bold shadow-sm transition-all hover:shadow-md border-border/40",
              showAnalytics && "bg-primary/10 text-primary border-primary/20"
            )}
          >
            {isProArtist ? (
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/60" />
            )}
            <span className="text-xs sm:text-sm">Analytics</span>
            {!isProArtist && <Crown className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />}
          </Button>
          <Button 
            onClick={handleUploadClick} 
            size="sm" 
            className="flex-1 sm:flex-none gap-2 h-10 sm:h-12 px-4 sm:px-6 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm">Upload New</span>
          </Button>
        </div>
      </div>

      {/* Analytics - Only for Pro Artists */}
      {showAnalytics && isProArtist && !analyticsLoading && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <ArtworkAnalytics data={analytics} />
        </div>
      )}

      {/* Search and Filters */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <ArtworkSearchFilters onFiltersChange={setFilters} />
      </div>

      {/* Bulk Actions */}
      <ArtworkBulkActions
        selectedArtworks={selectedArtworks}
        onClearSelection={() => setSelectedArtworks([])}
        onBulkAction={handleBulkAction}
        isLoading={bulkLoading}
      />

      {/* View Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] border border-border/40 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          {filteredArtworks.length > 0 && (
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <Checkbox
                checked={selectedArtworks.length === filteredArtworks.length && filteredArtworks.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all"
                className="h-5.5 w-5.5 rounded-lg border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all group-hover:border-primary/50"
              />
              <label htmlFor="select-all" className="text-xs sm:text-sm font-black text-foreground/70 cursor-pointer select-none group-hover:text-primary transition-colors uppercase tracking-widest">
                Select All
              </label>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-[1px] bg-border/20 hidden sm:block mx-1" />
            <span className="text-[10px] sm:text-xs font-black text-muted-foreground/50 whitespace-nowrap bg-muted/50 px-3 py-1 rounded-lg uppercase tracking-widest">
              {filteredArtworks.length} items
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] sm:text-xs font-black border border-primary/20 shadow-sm whitespace-nowrap uppercase tracking-widest">
              <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{pinnedCount}/5 pinned</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t border-border/10 sm:border-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 sm:hidden">Layout View</span>
          <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/60 p-1.5 shadow-inner">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-11 px-4 sm:px-5 rounded-xl transition-all font-black uppercase tracking-tighter text-[10px] sm:text-xs",
                viewMode === 'grid' ? "shadow-lg bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "h-11 px-4 sm:px-5 rounded-xl transition-all font-black uppercase tracking-tighter text-[10px] sm:text-xs",
                viewMode === 'list' ? "shadow-lg bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Artworks Grid/List */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
        {filteredArtworks.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8'
                : 'space-y-4 sm:space-y-6'
            }
          >
            {filteredArtworks.map((artwork) => (
              <ArtworkManagementCard
                key={artwork.id}
                artwork={artwork}
                isSelected={selectedArtworks.includes(artwork.id)}
                onSelect={(checked) => handleSelectArtwork(artwork.id, checked as boolean)}
                onEdit={() => setEditingArtwork(artwork)}
                onDelete={() => handleDeleteArtwork(artwork.id)}
                onUpdate={handleArtworkUpdate}
                viewMode={viewMode}
                pinnedCount={pinnedCount}
                isDeleting={deletingId === artwork.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[3rem] border-2 border-dashed border-border/40 bg-muted/20 backdrop-blur-sm">
            <div className="rounded-[2rem] bg-muted/50 p-6 mb-6 shadow-inner">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">No artworks found</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-sm mb-8 font-medium leading-relaxed opacity-70">
              {artworks.length === 0
                ? "Your creative journey starts here. Build your portfolio by uploading your first masterpiece."
                : "No artworks match your current filters. Try refining your search or clearing filters."}
            </p>
            {artworks.length === 0 && (
              <Button onClick={handleUploadClick} className="gap-3 h-12 px-8 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
                <Plus className="h-5 w-5" />
                Upload First Artwork
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none bg-background shadow-2xl">
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/10 px-6 py-5 sm:px-8 sm:py-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-black tracking-tight">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                Upload New Artwork
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground opacity-70">
                Share your creativity with the Artswarit community
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 sm:p-8">
            <ArtworkUploadForm onCancel={() => setShowUploadForm(false)} onSuccess={() => { setShowUploadForm(false); fetchArtworks(); }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editingArtwork && (
        <ArtworkEditModal
          artwork={editingArtwork}
          isOpen={!!editingArtwork}
          onClose={() => setEditingArtwork(null)}
          onSave={(updatedArtwork) => {
            handleArtworkUpdate(updatedArtwork);
            setEditingArtwork(null);
          }}
        />
      )}

      {/* Upgrade Prompt for Non-Pro Artists */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Unlock Advanced Analytics
            </DialogTitle>
            <DialogDescription>
              Advanced analytics are available exclusively for Pro Artists. Upgrade to see detailed performance metrics, revenue trends, and engagement insights.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold mb-2">Pro Artist Benefits:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time views, likes, and revenue tracking</li>
                <li>• 30-day growth metrics</li>
                <li>• Follower analytics</li>
                <li>• 0% platform fee on all earnings</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradePrompt(false)} className="flex-1">
                Maybe Later
              </Button>
              <Button asChild className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Link to="/artist-dashboard/premium">
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtworkManagement;