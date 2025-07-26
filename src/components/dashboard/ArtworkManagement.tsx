import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Grid, List, Filter, Eye, Heart, DollarSign, TrendingUp } from 'lucide-react';
import ArtworkUploadForm from './artwork/ArtworkUploadForm';
import ArtworkEditModal from './artwork/ArtworkEditModal';
import ArtworkBulkActions from './artwork/ArtworkBulkActions';
import ArtworkSearchFilters from './artwork/ArtworkSearchFilters';
import PinnedArtworks from './artwork/PinnedArtworks';
import ArtworkAnalytics from './artwork/ArtworkAnalytics';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useArtworks } from '@/hooks/useArtworks';
import { useArtistStats } from '@/hooks/useArtistStats';

const ArtworkManagement = () => {
  const { user } = useAuth();
  const { artworks, loading, toggleLike, fetchArtworks } = useArtworks({ 
    artistId: user?.id, 
    status: 'all' 
  });
  const { stats } = useArtistStats();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { notifications } = useNotifications();

  // Filter artworks based on search and filters
  const filteredArtworks = useMemo(() => {
    return artworks.filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (artwork.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || artwork.approval_status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || artwork.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [artworks, searchTerm, statusFilter, categoryFilter]);

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchArtworks(); // Refetch artworks
  };

  const handleBulkAction = async (action: string, artworkIds: string[]) => {
    // Handle bulk actions - implement with Supabase
    console.log('Bulk action:', action, artworkIds);
    // TODO: Implement bulk operations
    setSelectedArtworks([]);
    fetchArtworks(); // Refresh after bulk action
  };

  const handleSelectArtwork = (artworkId: string, checked: boolean) => {
    if (checked) {
      setSelectedArtworks([...selectedArtworks, artworkId]);
    } else {
      setSelectedArtworks(selectedArtworks.filter(id => id !== artworkId));
    }
  };

  const handleSelectAll = () => {
    if (selectedArtworks.length === filteredArtworks.length) {
      setSelectedArtworks([]);
    } else {
      setSelectedArtworks(filteredArtworks.map(a => a.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload New Artwork</h2>
              <Button variant="ghost" onClick={() => setShowUploadForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-6">
              <ArtworkUploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="font-semibold mb-4">Edit Artwork</h3>
            <p className="text-sm text-gray-600 mb-4">Editing: {editingArtwork?.title}</p>
            <Button onClick={() => setEditingArtwork(null)}>Close</Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Artworks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-6">
          {/* Analytics Cards */}
          {artworks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                      <p className="text-2xl font-bold">{stats.total_views.toLocaleString()}</p>
                    </div>
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                      <p className="text-2xl font-bold">{stats.total_likes.toLocaleString()}</p>
                    </div>
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Artworks</p>
                      <p className="text-2xl font-bold">{stats.total_artworks}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Followers</p>
                      <p className="text-2xl font-bold">{stats.total_followers}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">My Artworks</h2>
              <Badge variant="secondary">{artworks.length} total</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowUploadForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Artwork
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Digital Art">Digital Art</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Painting">Painting</SelectItem>
                    <SelectItem value="Abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArtworks.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm">{selectedArtworks.length} artwork(s) selected</p>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">Advanced filters will be available soon</p>
            </div>
          )}

          {/* Show message if no artworks */}
          {loading ? (
            <div className="text-center py-8">
              <p>Loading artworks...</p>
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {artworks.length === 0 ? "No artworks uploaded yet." : "No artworks match your filters."}
              </p>
              {artworks.length === 0 && (
                <Button onClick={() => setShowUploadForm(true)}>
                  Upload Your First Artwork
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Artwork Grid/List */}
              <div className="space-y-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArtworks.map((artwork) => (
                      <Card key={artwork.id} className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            <img 
                              src={artwork.image_url} 
                              alt={artwork.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg truncate">{artwork.title}</h3>
                              <Badge variant={
                                artwork.approval_status === 'approved' ? 'default' : 
                                artwork.approval_status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {artwork.approval_status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {artwork.views_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {artwork.likes_count}
                              </span>
                              {artwork.price && (
                                <span className="font-medium text-foreground">₹{artwork.price}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingArtwork(artwork)}>
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-4">
                    {filteredArtworks.map((artwork) => (
                      <Card key={artwork.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={artwork.image_url} 
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold truncate">{artwork.title}</h3>
                                <Badge variant={
                                  artwork.approval_status === 'approved' ? 'default' : 
                                  artwork.approval_status === 'pending' ? 'secondary' : 'destructive'
                                }>
                                  {artwork.approval_status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{artwork.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {artwork.views_count}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {artwork.likes_count}
                                </span>
                                {artwork.price && (
                                  <span className="font-medium text-foreground">₹{artwork.price}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button variant="outline" size="sm" onClick={() => setEditingArtwork(artwork)}>
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ArtworkAnalytics data={{
            totalViews: stats.total_views,
            totalLikes: stats.total_likes,
            totalRevenue: artworks.filter(a => a.is_for_sale && a.price).reduce((sum, a) => sum + (a.price || 0), 0),
            totalFollowers: stats.total_followers,
            viewsGrowth: 12.5,
            likesGrowth: 8.3,
            revenueGrowth: 15.7,
            followersGrowth: -2.1
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtworkManagement;