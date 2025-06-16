
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
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <Button
        onClick={onFollow}
        variant={isFollowing ? "secondary" : "default"}
        className={`w-full relative font-semibold transition-all ${
          isFollowing
            ? "bg-green-200 text-green-900"
            : "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-xl"
        } hover:scale-105`}
      >
        <UserPlus className="mr-1" size={17} />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <Button
        onClick={onMessage}
        variant="outline"
        className="w-full border-blue-400 text-blue-700 hover:bg-blue-200/60 hover:text-blue-900"
      >
        <MessageCircle size={17} className="mr-1" />
        Message Artist
      </Button>
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          variant="outline"
          disabled={loadingSave}
          className={`flex-1 border-pink-400 hover:text-pink-900 ${
            isSaved 
              ? 'bg-pink-100 text-pink-800 hover:bg-pink-200/60' 
              : 'text-pink-700 hover:bg-pink-200/50'
          }`}
        >
          <Save size={17} className="mr-1" />
          {isSaved ? "Saved" : "Save Artist"}
        </Button>
        <Button
          onClick={onRequest}
          variant="outline"
          className="flex-1 border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900"
        >
          <FilePlus size={17} className="mr-1" />
          Request Project
        </Button>
      </div>
    </div>
  );
};
export default ArtistActionsBar;
