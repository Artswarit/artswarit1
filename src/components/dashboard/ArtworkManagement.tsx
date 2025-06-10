
import { useState } from 'react';
import { useArtworks } from '@/hooks/useArtworks';
import { useAuth } from '@/contexts/AuthContext';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import ArtworkUpload from '@/components/artwork/ArtworkUpload';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload } from 'lucide-react';

const ArtworkManagement = () => {
  const { user } = useAuth();
  const { artworks, loading, fetchArtworks, toggleLike } = useArtworks();
  const [showUpload, setShowUpload] = useState(false);

  // Filter artworks for current user
  const userArtworks = artworks.filter(artwork => artwork.artist_id === user?.id);
  const pinnedArtworks = userArtworks.filter(artwork => artwork.is_pinned);
  const forSaleArtworks = userArtworks.filter(artwork => artwork.is_for_sale);

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upload New Artwork</h2>
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            Back to Gallery
          </Button>
        </div>
        <ArtworkUpload onClose={() => setShowUpload(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Artworks</h2>
        <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Artwork
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({userArtworks.length})</TabsTrigger>
          <TabsTrigger value="pinned">Pinned ({pinnedArtworks.length})</TabsTrigger>
          <TabsTrigger value="for-sale">For Sale ({forSaleArtworks.length})</TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {userArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  artistId={artwork.artistId}
                  type={artwork.type}
                  imageUrl={artwork.imageUrl}
                  likes={artwork.likes}
                  views={artwork.views}
                  price={artwork.price}
                  category={artwork.category}
                  audioUrl={artwork.audioUrl}
                  videoUrl={artwork.videoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
              <p className="text-gray-500 mb-4">Start building your portfolio by uploading your first artwork.</p>
              <Button onClick={() => setShowUpload(true)}>
                Upload Your First Artwork
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pinned" className="mt-6">
          {pinnedArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  artistId={artwork.artistId}
                  type={artwork.type}
                  imageUrl={artwork.imageUrl}
                  likes={artwork.likes}
                  views={artwork.views}
                  price={artwork.price}
                  category={artwork.category}
                  audioUrl={artwork.audioUrl}
                  videoUrl={artwork.videoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No pinned artworks</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="for-sale" className="mt-6">
          {forSaleArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {forSaleArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist}
                  artistId={artwork.artistId}
                  type={artwork.type}
                  imageUrl={artwork.imageUrl}
                  likes={artwork.likes}
                  views={artwork.views}
                  price={artwork.price}
                  category={artwork.category}
                  audioUrl={artwork.audioUrl}
                  videoUrl={artwork.videoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No artworks for sale</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <ArtworkUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtworkManagement;
