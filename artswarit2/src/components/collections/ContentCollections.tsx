
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Music, Image, Video, Trash2, Edit2, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CollectionItem {
  id: string;
  type: 'music' | 'image' | 'video';
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
  isPublic: boolean;
  createdAt: string;
}

const ContentCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Chill Vibes',
      description: 'Relaxing music for productivity',
      items: [
        {
          id: '1',
          type: 'music',
          title: 'Midnight Symphony',
          artist: 'Alex Rivera',
          thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
          duration: '3:45'
        },
        {
          id: '2',
          type: 'music',
          title: 'Ocean Waves',
          artist: 'Nature Sounds',
          thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=100&h=100&fit=crop',
          duration: '8:20'
        }
      ],
      isPublic: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Digital Art Favorites',
      description: 'My collection of stunning digital artworks',
      items: [
        {
          id: '3',
          type: 'image',
          title: 'Digital Dreamscape',
          artist: 'Maya Johnson',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop'
        },
        {
          id: '4',
          type: 'image',
          title: 'Abstract Emotions',
          artist: 'Creative Studio',
          thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop'
        }
      ],
      isPublic: false,
      createdAt: '2024-02-01'
    }
  ]);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      items: [],
      isPublic: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCollections([...collections, newCollection]);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const deleteCollection = (collectionId: string) => {
    setCollections(collections.filter(c => c.id !== collectionId));
  };

  const toggleCollectionVisibility = (collectionId: string) => {
    setCollections(collections.map(c => 
      c.id === collectionId ? { ...c, isPublic: !c.isPublic } : c
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getTotalDuration = (collection: Collection) => {
    const totalSeconds = collection.items.reduce((total, item) => {
      if (item.duration) {
        const [minutes, seconds] = item.duration.split(':').map(Number);
        return total + (minutes * 60) + seconds;
      }
      return total;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Collections</h2>
          <p className="text-muted-foreground">Organize your favorite content into playlists</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={createCollection} className="flex-1">
                  Create Collection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{collection.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600"
                    onClick={() => deleteCollection(collection.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={collection.isPublic ? "default" : "secondary"}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {collection.items.length} items
                </span>
                {collection.items.some(item => item.duration) && (
                  <span className="text-xs text-muted-foreground">
                    • {getTotalDuration(collection)}
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Collection Preview */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {collection.items.slice(0, 4).map((item, index) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                ))}
                {collection.items.length === 0 && (
                  <div className="col-span-2 aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedCollection(collection)}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Play All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleCollectionVisibility(collection.id)}
                >
                  {collection.isPublic ? 'Make Private' : 'Make Public'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collection Details Modal */}
      {selectedCollection && (
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCollection.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedCollection.description}</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCollection.items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {item.duration && (
                        <span className="text-xs text-muted-foreground">{item.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentCollections;
