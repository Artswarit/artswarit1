
import React, { useState } from "react";
import { MessageSquare, Bookmark } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved((prev) => !prev);
    onSave();
  };
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {/* Follow button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onFollow}
              className={
                `w-full flex items-center justify-center font-semibold rounded-lg py-2.5 transition-all duration-150 text-base
                ${isFollowing ? "bg-green-100 text-green-700 ring-1 ring-green-300 hover:bg-green-200" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"}
                hover:scale-105 active:scale-100`
              }
              style={{ minHeight: 44 }}
            >
              {isFollowing ? (
                <>
                  <span className="text-lg mr-2">✅</span>
                  Following
                </>
              ) : (
                <>
                  <span className="text-lg mr-2">➕</span>
                  Follow
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isFollowing ? "Unfollow this artist" : "Follow this artist"}
          </TooltipContent>
        </Tooltip>
        {/* Message */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMessage}
              className="w-full flex items-center justify-center rounded-lg border border-blue-400 text-blue-800 bg-white hover:bg-blue-50 transition-all py-2"
              style={{ minHeight: 44 }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Artist
            </button>
          </TooltipTrigger>
          <TooltipContent>Direct message the artist</TooltipContent>
        </Tooltip>
        {/* Save & Request */}
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSave}
                className={
                  `flex-1 rounded-lg border border-pink-400 text-pink-700 bg-white hover:bg-pink-50 transition-all flex items-center justify-center py-2` +
                  (isSaved ? " bg-pink-100 text-pink-900 border-2 border-pink-500 font-bold" : "")
                }
                style={{ minHeight: 44 }}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                {isSaved ? "Saved" : "Save Artist"}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isSaved ? "Artist is in your favorites" : "Save this artist to your favorites"}
            </TooltipContent>
          </Tooltip>
          {canRequest && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRequest}
                  className="flex-1 rounded-lg border border-yellow-400 text-amber-800 bg-white hover:bg-amber-50 transition-all flex items-center justify-center py-2"
                  style={{ minHeight: 44 }}
                >
                  <span className="mr-1">📝</span>
                  Request Project
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Request a commission/project from this artist
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ArtistActionsBar;
