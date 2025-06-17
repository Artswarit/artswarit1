
import React from "react";
import { MessageCircle, Save, FilePlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArtistActionsBarProps {
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  isSaved: boolean;
  onSave: () => void;
  onRequest: () => void;
  loadingSave: boolean;
}

const ArtistActionsBar: React.FC<ArtistActionsBarProps> = ({
  isFollowing,
  onFollow,
  onMessage,
  isSaved,
  onSave,
  onRequest,
  loadingSave,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Primary Follow Button - Full width responsive */}
      <Button
        onClick={onFollow}
        variant={isFollowing ? "secondary" : "default"}
        className={`w-full relative font-semibold transition-all text-sm min-h-[44px] ${
          isFollowing
            ? "bg-green-200 text-green-900"
            : "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-xl"
        } hover:scale-105`}
      >
        <UserPlus className="mr-2" size={16} />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>

      {/* Message Button - Full width responsive */}
      <Button
        onClick={onMessage}
        variant="outline"
        className="w-full border-blue-400 text-blue-700 hover:bg-blue-200/60 hover:text-blue-900 text-sm min-h-[44px]"
      >
        <MessageCircle size={16} className="mr-2" />
        <span className="hidden xs:inline">Message Artist</span>
        <span className="xs:hidden">Message</span>
      </Button>

      {/* Action Buttons Row - Always stacked on mobile for better touch targets */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={onSave}
          variant="outline"
          disabled={loadingSave}
          className={`flex-1 border-pink-400 hover:text-pink-900 text-sm min-h-[44px] ${
            isSaved 
              ? 'bg-pink-100 text-pink-800 hover:bg-pink-200/60' 
              : 'text-pink-700 hover:bg-pink-200/50'
          }`}
        >
          <Save size={16} className="mr-2" />
          <span className="hidden sm:inline">{isSaved ? "Saved" : "Save Artist"}</span>
          <span className="sm:hidden">{isSaved ? "Saved" : "Save"}</span>
        </Button>

        <Button
          onClick={onRequest}
          variant="outline"
          className="flex-1 border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900 text-sm min-h-[44px]"
        >
          <FilePlus size={16} className="mr-2" />
          <span className="hidden sm:inline">Request Project</span>
          <span className="sm:hidden">Request</span>
        </Button>
      </div>
    </div>
  );
};

export default ArtistActionsBar;
