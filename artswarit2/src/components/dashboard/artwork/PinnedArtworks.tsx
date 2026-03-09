
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface ArtworkItem {
  id: string;
  title: string;
  imageUrl: string;
  isPinned: boolean;
}

const PinnedArtworks = () => {
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ArtworkItem[]>([
    {
      id: "1",
      title: "Abstract Harmony",
      imageUrl: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      isPinned: true
    },
    {
      id: "2",
      title: "Urban Poetry",
      imageUrl: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      isPinned: true
    },
    {
      id: "3",
      title: "Music Flow",
      imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      isPinned: true
    },
    {
      id: "4",
      title: "Digital Dreams",
      imageUrl: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      isPinned: false
    },
    {
      id: "5",
      title: "Futuristic Melodies",
      imageUrl: "https://images.unsplash.com/photo-1614173188975-0e2aae485595?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      isPinned: false
    },
  ]);

  const handleTogglePin = (id: string) => {
    const pinnedCount = artworks.filter(art => art.isPinned).length;
    const artwork = artworks.find(art => art.id === id);
    
    if (artwork && !artwork.isPinned && pinnedCount >= 3) {
      toast({
        title: "Pin limit reached",
        description: "You can pin a maximum of 3 artworks. Unpin an artwork first.",
        variant: "destructive",
      });
      return;
    }
    
    setArtworks(artworks.map(art => 
      art.id === id ? { ...art, isPinned: !art.isPinned } : art
    ));
    
    toast({
      title: artwork && artwork.isPinned ? "Artwork unpinned" : "Artwork pinned",
      description: artwork && artwork.isPinned 
        ? `"${artwork.title}" has been unpinned from your profile.` 
        : `"${artwork.title}" has been pinned to your profile.`,
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const pinnedItems = artworks.filter(item => item.isPinned);
    const reorderedItems = Array.from(pinnedItems);
    
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    
    const updatedArtworks = artworks.map(art => {
      if (!art.isPinned) return art;
      
      const reorderedItem = reorderedItems.find(item => item.id === art.id);
      return reorderedItem || art;
    });
    
    setArtworks(updatedArtworks);
  };

  const pinnedArtworks = artworks.filter(art => art.isPinned);
  const unpinnedArtworks = artworks.filter(art => !art.isPinned);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pinned Artworks</CardTitle>
          <CardDescription>
            Drag and drop to reorder your pinned artworks. You can pin up to 3 artworks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pinnedArtworks.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pinnedArtworks">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {pinnedArtworks.map((artwork, index) => (
                      <Draggable key={artwork.id} draggableId={artwork.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-lg border p-3 shadow-sm"
                          >
                            <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
                              <img 
                                src={artwork.imageUrl} 
                                alt={artwork.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{artwork.title}</h4>
                                <Badge variant="secondary" className="bg-primary/20 hover:bg-primary/30">
                                  Pinned
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleTogglePin(artwork.id)}
                            >
                              Unpin
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pinned artworks. Pin your best artworks to showcase them prominently on your profile.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Artworks</CardTitle>
          <CardDescription>
            Pin more artworks to your profile (maximum 3 pins).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unpinnedArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpinnedArtworks.map(artwork => (
                <div 
                  key={artwork.id}
                  className="flex items-center bg-white rounded-lg border p-3"
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{artwork.title}</h4>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={() => handleTogglePin(artwork.id)}
                  >
                    Pin
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              All your artworks are pinned. Upload more artworks to add to your collection.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PinnedArtworks;
