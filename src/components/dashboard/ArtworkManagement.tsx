import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useArtworks } from '@/hooks/useArtworks';
import { Grid, List, Plus, BarChart3, Heart, Eye } from 'lucide-react';
import ArtworkUploadForm from './artwork/ArtworkUploadForm';
import ArtworkEditModal from './artwork/ArtworkEditModal';
import ArtworkActions from './artwork/ArtworkActions';
import ArtworkSearchFilters from './artwork/ArtworkSearchFilters';
import ArtworkBulkActions from './artwork/ArtworkBulkActions';
import ArtworkAnalytics from './artwork/ArtworkAnalytics';

const ArtworkManagement = () => {
  const { artworks, loading } = useArtworks();
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

  // Mock analytics data
  const analyticsData = {
    totalViews: 45670,
    totalLikes: 8900,
    totalRevenue: 12450,
    totalFollowers: 1234,
    viewsGrowth: 12.5,
    likesGrowth: 8.3,
    revenueGrowth: 15.7,
    followersGrowth: -2.1
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

  const handleBulkAction = (action: string, options?: any) => {
    console.log('Bulk action:', action, 'for artworks:', selectedArtworks, 'with options:', options);
    
    switch (action) {
      case 'delete':
        toast({
          title: "Artworks Deleted",
          description: `${selectedArtworks.length} artwork(s) have been deleted.`,
        });
        setSelectedArtworks([]);
        break;
      case 'changeStatus':
        toast({
          title: "Status Updated",
          description: `${selectedArtworks.length} artwork(s) status changed to ${options.status}.`,
        });
        break;
      case 'toggleVisibility':
        toast({
          title: "Visibility Toggled",
          description: `${selectedArtworks.length} artwork(s) visibility has been toggled.`,
        });
        break;
      case 'export':
        toast({
          title: "Export Started",
          description: `Exporting ${selectedArtworks.length} artwork(s)...`,
        });
        break;
      case 'archive':
        toast({
          title: "Artworks Archived",
          description: `${selectedArtworks.length} artwork(s) have been archived.`,
        });
        setSelectedArtworks([]);
        break;
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

  const formatPrice = (price?: number | null) => {
    if (price === null || typeof price === 'undefined') return '—';
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const handleArtworkUpdate = (updatedArtwork: any) => {
    console.log('Updating artwork:', updatedArtwork);
    toast({
      title: "Artwork Updated",
      description: "Your artwork has been updated successfully.",
    });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artwork Management</h2>
          <p className="text-gray-600">Manage and organize your artwork collection</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <Checkbox
            checked={selectedArtworks.length === filteredArtworks.length}
            onCheckedChange={handleSelectAll}
          />
          <span>Select all artworks</span>
        </div>
      )}

      {/* Artworks Grid/List */}
      {filteredArtworks.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredArtworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {viewMode === 'grid' ? (
                <>
                  <div className="relative">
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title || 'Artwork image'}
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
                  <CardContent className="p-4 space-y-1.5">
                    <h3 className="font-semibold truncate">{artwork.title || 'Untitled artwork'}</h3>
                    <p className="text-sm text-gray-600">{artwork.category || 'Uncategorized'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold">{formatPrice(artwork.price)}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {artwork.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {artwork.views}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <ArtworkActions
                        artwork={artwork}
                        onUpdate={handleArtworkUpdate}
                      />
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedArtworks.includes(artwork.id)}
                        onCheckedChange={(checked) => handleSelectArtwork(artwork.id, checked as boolean)}
                      />
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title || 'Artwork image'}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{artwork.title || 'Untitled artwork'}</h3>
                      <p className="text-sm text-gray-600 truncate">{artwork.category || 'Uncategorized'}</p>
                      <p className="text-xs text-gray-500">Created: {formatDate(artwork.created_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <div className="text-lg font-bold">{formatPrice(artwork.price)}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {artwork.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {artwork.views}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(artwork.approval_status)}
                      <ArtworkActions
                        artwork={artwork}
                        onUpdate={handleArtworkUpdate}
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
            <ArtworkUploadForm />
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
