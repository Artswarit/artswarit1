import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useArtworks } from '@/hooks/useArtworks';
import { useAuth } from '@/contexts/AuthContext';
import { useArtistStats } from '@/hooks/useArtistStats';
import { Grid, List, Plus, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ArtworkUploadForm from './artwork/ArtworkUploadForm';
import ArtworkEditModal from './artwork/ArtworkEditModal';
import ArtworkActions from './artwork/ArtworkActions';
import ArtworkSearchFilters from './artwork/ArtworkSearchFilters';
import ArtworkBulkActions from './artwork/ArtworkBulkActions';
import ArtworkAnalytics from './artwork/ArtworkAnalytics';

const ArtworkManagement = () => {
  const { user } = useAuth();
  const { artworks, loading, refetch, uploadArtwork } = useArtworks({ artistId: user?.id, status: 'all' });
  const { stats } = useArtistStats();
  const { toast } = useToast();
  
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    type: 'all',
    tags: [] as string[],
    sortBy: 'newest'
  });

  // Real analytics data from backend
  const analyticsData = {
    totalViews: stats.total_views || 0,
    totalLikes: stats.total_likes || 0,
    totalRevenue: artworks.filter(a => a.is_for_sale && a.price).reduce((sum, a) => sum + (a.price || 0), 0),
    totalFollowers: stats.total_followers || 0,
    viewsGrowth: 12.5, // TODO: Calculate growth from historical data
    likesGrowth: 8.3,   // TODO: Calculate growth from historical data
    revenueGrowth: 15.7, // TODO: Calculate growth from historical data
    followersGrowth: -2.1 // TODO: Calculate growth from historical data
  };

  const filteredArtworks = useMemo(() => {
    let filtered = [...artworks];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(artwork =>
        artwork.title.toLowerCase().includes(searchTerm) ||
        artwork.artist.toLowerCase().includes(searchTerm) ||
        artwork.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(artwork => artwork.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(artwork => artwork.approval_status === filters.status);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(artwork => artwork.type === filters.type);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(artwork =>
        artwork.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most_liked':
        filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'most_viewed':
        filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [artworks, filters]);

  const handleSelectArtwork = (artworkId: string, checked: boolean) => {
    if (checked) {
      setSelectedArtworks([...selectedArtworks, artworkId]);
    } else {
      setSelectedArtworks(selectedArtworks.filter(id => id !== artworkId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArtworks(filteredArtworks.map(artwork => artwork.id));
    } else {
      setSelectedArtworks([]);
    }
  };

  const handleBulkAction = async (action: string, options?: any) => {
    if (!user || selectedArtworks.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          const { error: deleteError } = await supabase
            .from('artworks')
            .delete()
            .in('id', selectedArtworks)
            .eq('artist_id', user.id);

          if (deleteError) throw deleteError;

          toast({
            title: "Artworks Deleted",
            description: `${selectedArtworks.length} artwork(s) have been deleted.`,
          });
          setSelectedArtworks([]);
          refetch();
          break;

        case 'changeStatus':
          const { error: statusError } = await supabase
            .from('artworks')
            .update({ approval_status: options.status })
            .in('id', selectedArtworks)
            .eq('artist_id', user.id);

          if (statusError) throw statusError;

          toast({
            title: "Status Updated",
            description: `${selectedArtworks.length} artwork(s) status changed to ${options.status}.`,
          });
          refetch();
          break;

        case 'toggleVisibility':
          // Note: This would require a visibility column in the database
          toast({
            title: "Feature Coming Soon",
            description: "Visibility toggle feature will be available soon.",
          });
          break;

        case 'export':
          // Export selected artworks data
          const exportData = artworks
            .filter(artwork => selectedArtworks.includes(artwork.id))
            .map(artwork => ({
              title: artwork.title,
              category: artwork.category,
              price: artwork.price,
              likes: artwork.likes_count,
              views: artwork.views_count,
              status: artwork.approval_status,
              created_at: artwork.created_at
            }));

          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "artworks_export.json");
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();

          toast({
            title: "Export Complete",
            description: `Exported ${selectedArtworks.length} artwork(s) data.`,
          });
          break;

        case 'archive':
          // Note: This would require an archived status or column
          const { error: archiveError } = await supabase
            .from('artworks')
            .update({ approval_status: 'archived' })
            .in('id', selectedArtworks)
            .eq('artist_id', user.id);

          if (archiveError) throw archiveError;

          toast({
            title: "Artworks Archived",
            description: `${selectedArtworks.length} artwork(s) have been archived.`,
          });
          setSelectedArtworks([]);
          refetch();
          break;
      }
    } catch (error: any) {
      console.error('Bulk action error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to perform bulk action",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleArtworkUpdate = async (updatedArtwork: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: updatedArtwork.title,
          description: updatedArtwork.description,
          category: updatedArtwork.category,
          price: updatedArtwork.price,
          is_for_sale: updatedArtwork.is_for_sale,
          is_pinned: updatedArtwork.is_pinned,
          tags: updatedArtwork.tags
        })
        .eq('id', updatedArtwork.id)
        .eq('artist_id', user.id);

      if (error) throw error;

      toast({
        title: "Artwork Updated",
        description: "Your artwork has been updated successfully.",
      });
      refetch();
    } catch (error: any) {
      console.error('Error updating artwork:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update artwork",
        variant: "destructive"
      });
    }
  };

  const handleArtworkDelete = async (artworkId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId)
        .eq('artist_id', user.id);

      if (error) throw error;

      toast({
        title: "Artwork Deleted",
        description: "Your artwork has been deleted successfully.",
      });
      refetch();
    } catch (error: any) {
      console.error('Error deleting artwork:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete artwork",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artwork Management</h2>
          <p className="text-gray-600">Manage and organize your artwork collection</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setShowUploadForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload New
          </Button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <ArtworkAnalytics data={analyticsData} />
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Select All */}
      {filteredArtworks.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedArtworks.length === filteredArtworks.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">Select all artworks</span>
        </div>
      )}

      {/* Artworks Grid/List */}
      {filteredArtworks.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredArtworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === 'grid' ? (
                <>
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedArtworks.includes(artwork.id)}
                        onCheckedChange={(checked) => handleSelectArtwork(artwork.id, checked as boolean)}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(artwork.approval_status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{artwork.title}</h3>
                    <p className="text-sm text-gray-600">{artwork.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold">${artwork.price}</span>
                      <div className="text-xs text-gray-500">
                        {artwork.likes_count || 0} ❤️ {artwork.views_count || 0} 👁️
                      </div>
                    </div>
                    <div className="mt-3">
                      <ArtworkActions
                        artwork={artwork}
                        onUpdate={handleArtworkUpdate}
                        onDelete={handleArtworkDelete}
                      />
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedArtworks.includes(artwork.id)}
                      onCheckedChange={(checked) => handleSelectArtwork(artwork.id, checked as boolean)}
                    />
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{artwork.title}</h3>
                      <p className="text-sm text-gray-600">{artwork.category}</p>
                      <p className="text-xs text-gray-500">Created: {formatDate(artwork.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${artwork.price}</div>
                      <div className="text-xs text-gray-500">
                        {artwork.likes_count || 0} ❤️ {artwork.views_count || 0} 👁️
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(artwork.approval_status)}
                      <ArtworkActions
                        artwork={artwork}
                        onUpdate={handleArtworkUpdate}
                        onDelete={handleArtworkDelete}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No artworks found matching your criteria.</p>
            <Button className="mt-4" onClick={() => setShowUploadForm(true)}>
              Upload Your First Artwork
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Upload New Artwork</h3>
              <Button variant="ghost" onClick={() => setShowUploadForm(false)}>
                ×
              </Button>
            </div>
            <ArtworkUploadForm onUploadSuccess={() => {
              setShowUploadForm(false);
              refetch();
            }} />
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ArtworkManagement;
