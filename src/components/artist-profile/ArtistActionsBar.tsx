
import React from "react";
import { MessageCircle, Save, FilePlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArtistActionsBarProps {
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onSave: () => void;
  onRequest: () => void;
}

const ArtistActionsBar: React.FC<ArtistActionsBarProps> = ({
  isFollowing,
  onFollow,
  onMessage,
  onSave,
  onRequest,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={onFollow}
        variant={isFollowing ? "secondary" : "default"}
        className={`relative font-semibold transition-all ${
          isFollowing ? "bg-green-200 text-green-900" : "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-xl"
        } hover:scale-105`}
      >
        <UserPlus className="mr-1" size={17} />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <Button
        onClick={onMessage}
        variant="outline"
        className="border-blue-400 text-blue-700 hover:bg-blue-200/60 hover:text-blue-900"
      >
        <MessageCircle size={17} className="mr-1" />
        Message
      </Button>
      <Button
        onClick={onSave}
        variant="outline"
        className="border-pink-400 text-pink-700 hover:bg-pink-200/50 hover:text-pink-900"
      >
        <Save size={17} className="mr-1" />
        Save Artist
      </Button>
      <Button
        onClick={onRequest}
        variant="outline"
        className="border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900"
      >
        <FilePlus size={17} className="mr-1" />
        Request Project
      </Button>
    </div>
  );
};
export default ArtistActionsBar;
