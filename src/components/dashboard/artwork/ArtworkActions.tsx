
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/80">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            Edit Details & Pricing
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handlePinToggle} className="cursor-pointer">
            {artwork.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin from Profile
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin to Profile
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSaleToggle} className="cursor-pointer">
            <DollarSign className="h-4 w-4 mr-2" />
            {artwork.is_for_sale ? "Remove from Sale" : "Mark for Sale"}
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer">
            <Eye className="h-4 w-4 mr-2" />
            View Public Page
          </DropdownMenuItem>

          {onDelete && (
            <DropdownMenuItem 
              onClick={() => onDelete(artwork.id)}
              className="text-red-600 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
