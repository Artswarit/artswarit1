
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
    <div className="space-y-8">
      <Card className="rounded-[2.5rem] shadow-xl shadow-primary/5 border-primary/10 overflow-hidden backdrop-blur-md bg-background/50">
        <CardHeader className="space-y-2 pb-6 border-b border-primary/5">
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Pinned Artworks</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Drag and drop to reorder your pinned artworks. You can pin up to <span className="text-primary font-black">3</span> artworks.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
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
                            className="flex items-center bg-background/60 backdrop-blur-xl rounded-3xl border border-primary/10 p-4 shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all group"
                          >
                            <div className="h-20 w-20 rounded-2xl overflow-hidden mr-5 shadow-inner border border-white/10 shrink-0">
                              <img 
                                src={artwork.imageUrl} 
                                alt={artwork.title} 
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h4 className="font-black text-lg tracking-tight truncate">{artwork.title}</h4>
                                <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                  Pinned
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-12 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95 ml-4 shrink-0"
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
            <div className="text-center py-16 px-4 bg-muted/20 rounded-3xl border border-dashed border-primary/20">
              <p className="text-muted-foreground font-medium text-lg">No pinned artworks yet.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Pin your best work to showcase it on your profile.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] shadow-xl shadow-primary/5 border-primary/10 overflow-hidden backdrop-blur-md bg-background/50">
        <CardHeader className="space-y-2 pb-6 border-b border-primary/5">
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Other Artworks</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Pin more artworks to your profile (maximum 3 pins).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {unpinnedArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpinnedArtworks.map(artwork => (
                <div 
                  key={artwork.id}
                  className="flex items-center bg-background/40 backdrop-blur-sm rounded-3xl border border-primary/5 p-4 hover:border-primary/20 transition-all group"
                >
                  <div className="h-20 w-20 rounded-2xl overflow-hidden mr-5 shadow-inner border border-white/10 shrink-0">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg tracking-tight truncate">{artwork.title}</h4>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-12 px-6 rounded-xl border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-lg transition-all active:scale-95 ml-4 shrink-0"
                    onClick={() => handleTogglePin(artwork.id)}
                  >
                    Pin
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-3xl border border-dashed border-primary/20">
              <p className="text-muted-foreground font-medium text-lg">All your artworks are pinned.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Upload more work to continue building your collection.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PinnedArtworks;
