
import React from "react";
import { MessageCircle, Save, FilePlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArtistActionsBarProps {
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onSave: () => void;
  onRequest: () => void;
  canRequest?: boolean;
}

const ArtistActionsBar: React.FC<ArtistActionsBarProps> = ({
  isFollowing,
  onFollow,
  onMessage,
  onSave,
  onRequest,
  canRequest = true,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <Button
        onClick={onFollow}
        variant={isFollowing ? "secondary" : "default"}
        className={`w-full relative font-semibold shadow-lg transition-all ${
          isFollowing
            ? "bg-green-200 text-green-900"
            : "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-xl"
        } hover:scale-105 hover:shadow-2xl`}
      >
        <UserPlus className="mr-1" size={17} />
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <Button
        onClick={onMessage}
        variant="outline"
        className="w-full border-blue-400 text-blue-700 hover:bg-blue-200/60 hover:text-blue-900 shadow-md"
      >
        <MessageCircle size={17} className="mr-1" />
        Message Artist
      </Button>
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          variant="outline"
          className="flex-1 border-pink-400 text-pink-700 hover:bg-pink-200/50 hover:text-pink-900 shadow-md"
        >
          <Save size={17} className="mr-1" />
          Save Artist
        </Button>
        {canRequest && (
          <Button
            onClick={onRequest}
            variant="outline"
            className="flex-1 border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900 shadow-md"
          >
            <FilePlus size={17} className="mr-1" />
            Request Project
          </Button>
        )}
      </div>
    </div>
  );
};
export default ArtistActionsBar;
