import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useArtworks } from '@/hooks/useArtworks';
import { useAuth } from '@/contexts/AuthContext';
import { useArtistPlan } from '@/hooks/useArtistPlan';
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
  const { artworks, loading, fetchArtworks } = useArtworks();
  const { toast } = useToast();
  const { isProArtist, loading: planLoading } = useArtistPlan(user?.id);
  const { analytics, loading: analyticsLoading } = useRealAnalytics();
  
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all',
    tags: [] as string[],
    sortBy: 'newest',
  });

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
          artwork.title.toLowerCase().includes(searchTerm) ||
          artwork.artist.toLowerCase().includes(searchTerm) ||
          artwork.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((artwork) => artwork.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((artwork) => artwork.approval_status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((artwork) => artwork.type === filters.type);
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((artwork) =>
        artwork.tags?.some((tag) => filters.tags.includes(tag))
      );
    }

    // Apply sorting based on filter
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most_liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'most_viewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Always sort pinned artworks first
    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });

    return filtered;
  }, [artworks, filters]);

  // Count pinned artworks
  const pinnedCount = useMemo(() => {
    return artworks.filter((artwork) => artwork.is_pinned).length;
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
    
    switch (action) {
      case 'delete':
        try {
          // Delete each selected artwork
          for (const artworkId of selectedArtworks) {
            const { error } = await supabase.functions.invoke('delete-artwork-and-media', {
              body: { artworkId }
            });
            if (error) throw error;
          }
          toast({
            title: 'Artworks Deleted',
            description: `${selectedArtworks.length} artwork(s) have been deleted.`,
          });
          setSelectedArtworks([]);
          fetchArtworks();
        } catch (err: any) {
          toast({
            title: 'Error',
            description: err.message || 'Failed to delete artworks',
            variant: 'destructive',
          });
        }
        break;
      case 'changeStatus':
        try {
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
        } catch (err: any) {
          toast({
            title: 'Error',
            description: err.message || 'Failed to update status',
            variant: 'destructive',
          });
        }
        break;
      case 'archive':
        try {
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
        } catch (err: any) {
          toast({
            title: 'Error',
            description: err.message || 'Failed to archive artworks',
            variant: 'destructive',
          });
        }
        break;
      case 'export':
        // Export artworks data as JSON
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
  };

  const handleArtworkUpdate = (updatedArtwork: any) => {
    fetchArtworks(); // Refresh the list
    toast({
      title: 'Artwork Updated',
      description: 'Your artwork has been updated successfully.',
    });
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    try {
      // Call the edge function to delete artwork and associated media
      const { data, error } = await supabase.functions.invoke('delete-artwork-and-media', {
        body: { artworkId }
      });

      if (error) throw error;

      toast({
        title: 'Artwork Deleted',
        description: 'Your artwork has been deleted successfully.',
      });

      // Refresh the list - real-time will also trigger this
      fetchArtworks();
    } catch (err: any) {
      console.error('Error deleting artwork:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete artwork.',
        variant: 'destructive',
      });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Artwork Management</h2>
          <p className="text-muted-foreground mt-1">Manage and organize your artwork collection</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showAnalytics ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleAnalyticsClick}
            className="gap-2"
          >
            {isProArtist ? (
              <BarChart3 className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Analytics</span>
            {!isProArtist && <Crown className="h-3 w-3 text-yellow-500" />}
          </Button>
          <Button onClick={() => setShowUploadForm(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload New</span>
          </Button>
        </div>
      </div>

      {/* Analytics - Only for Pro Artists */}
      {showAnalytics && isProArtist && !analyticsLoading && (
        <ArtworkAnalytics data={analytics} />
      )}

      {/* Search and Filters */}
      <ArtworkSearchFilters onFiltersChange={setFilters} />

      {/* Bulk Actions */}
      <ArtworkBulkActions
        selectedArtworks={selectedArtworks}
        onClearSelection={() => setSelectedArtworks([])}
        onBulkAction={handleBulkAction}
      />

      {/* View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {filteredArtworks.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedArtworks.length === filteredArtworks.length && filteredArtworks.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
                Select all
              </label>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Pin className="h-3.5 w-3.5" />
            <span>Pinned {pinnedCount}/5</span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Artworks Grid/List */}
      {filteredArtworks.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
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
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-border bg-muted/30">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No artworks found</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            {artworks.length === 0
              ? "Start building your portfolio by uploading your first artwork."
              : "No artworks match your current filters. Try adjusting your search criteria."}
          </p>
          {artworks.length === 0 && (
            <Button onClick={() => setShowUploadForm(true)} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              Upload Your First Artwork
            </Button>
          )}
        </div>
      )}

      {/* Upload Form Modal */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              Upload New Artwork
            </DialogTitle>
          </DialogHeader>
          <ArtworkUploadForm onCancel={() => setShowUploadForm(false)} onSuccess={() => { setShowUploadForm(false); fetchArtworks(); }} />
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
                <Link to="/artist-dashboard?tab=subscription">
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