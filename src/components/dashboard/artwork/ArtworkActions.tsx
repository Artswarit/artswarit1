
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Pin, PinOff, Trash2, DollarSign } from "lucide-react";
import ArtworkEditModal from "./ArtworkEditModal";

interface ArtworkActionsProps {
  artwork: any;
  onUpdate: (updatedArtwork: any) => void;
  onDelete?: (artworkId: string) => void;
}

const ArtworkActions = ({ artwork, onUpdate, onDelete }: ArtworkActionsProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePinToggle = () => {
    const updatedArtwork = {
      ...artwork,
      is_pinned: !artwork.is_pinned
    };
    onUpdate(updatedArtwork);
  };

  const handleSaleToggle = () => {
    const updatedArtwork = {
      ...artwork,
      is_for_sale: !artwork.is_for_sale
    };
    onUpdate(updatedArtwork);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-white/80 transition-all active:scale-95 rounded-xl">
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] border-primary/10 shadow-2xl backdrop-blur-xl bg-background/95 animate-in fade-in zoom-in-95 duration-200">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer min-h-[48px] sm:min-h-[44px] gap-3 px-4 rounded-xl hover:bg-primary/5 focus:bg-primary/5 transition-colors">
            <Edit className="h-5 w-5 text-primary/70" />
            <span className="font-bold text-sm">Edit Details & Pricing</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handlePinToggle} className="cursor-pointer min-h-[48px] sm:min-h-[44px] gap-3 px-4 rounded-xl hover:bg-primary/5 focus:bg-primary/5 transition-colors">
            {artwork.is_pinned ? (
              <>
                <PinOff className="h-5 w-5 text-primary/70" />
                <span className="font-bold text-sm">Unpin from Profile</span>
              </>
            ) : (
              <>
                <Pin className="h-5 w-5 text-primary/70" />
                <span className="font-bold text-sm">Pin to Profile</span>
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSaleToggle} className="cursor-pointer min-h-[48px] sm:min-h-[44px] gap-3 px-4 rounded-xl hover:bg-primary/5 focus:bg-primary/5 transition-colors">
            <DollarSign className="h-5 w-5 text-primary/70" />
            <span className="font-bold text-sm">{artwork.is_for_sale ? "Remove from Sale" : "Mark for Sale"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer min-h-[48px] sm:min-h-[44px] gap-3 px-4 rounded-xl hover:bg-primary/5 focus:bg-primary/5 transition-colors">
            <Eye className="h-5 w-5 text-primary/70" />
            <span className="font-bold text-sm">View Public Page</span>
          </DropdownMenuItem>

          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(artwork.id)}
              className="text-destructive cursor-pointer min-h-[48px] sm:min-h-[44px] gap-3 px-4 rounded-xl hover:bg-destructive/5 focus:bg-destructive/5 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-bold text-sm">Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ArtworkEditModal
        artwork={artwork}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onUpdate}
      />
    </>
  );
};

export default ArtworkActions;
