import React from "react";
import { MessageCircle, Save, FilePlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {/* Follow button with icon and subtle animation */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onFollow}
              className={`w-full flex items-center justify-center relative font-semibold shadow-glass transition-all duration-200 rounded-md py-2
                ${isFollowing
                  ? "bg-green-200 text-green-900 hover:bg-green-300"
                  : "bg-gradient-to-r from-violet-600 to-indigo-500 text-white hover:from-violet-700 hover:to-indigo-600"}
                hover:scale-[1.035] active:scale-100
              `}
            >
              {isFollowing ? (
                <>
                  <span className="text-lg mr-1">✅</span>
                  Following
                </>
              ) : (
                <>
                  <span className="text-lg mr-1">➕</span>
                  Follow
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{isFollowing ? "Unfollow this artist" : "Follow this artist"}</TooltipContent>
        </Tooltip>

        {/* Message */}
        <button
          onClick={onMessage}
          className="w-full rounded-md border border-blue-400 text-blue-700 hover:bg-blue-200/60 hover:text-blue-900 shadow-md transition-all duration-150 py-2 flex items-center justify-center"
        >
          <span className="mr-1">💬</span> Message Artist
        </button>

        {/* Save + Request split */}
        <div className="flex gap-2">
          {/* Save artist w/ hover text */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onSave}
                className="flex-1 rounded-md border border-pink-400 text-pink-700 hover:bg-pink-100/60 hover:text-pink-900 shadow-md transition-all duration-150 py-2 flex items-center justify-center"
              >
                <span className="mr-1">💾</span>
                Save Artist
              </button>
            </TooltipTrigger>
            <TooltipContent>Save this artist to your favorites</TooltipContent>
          </Tooltip>
          {/* Request Project logic */}
          {canRequest && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRequest}
                  className="flex-1 rounded-md border border-yellow-400 text-amber-800 hover:bg-amber-100/70 hover:text-amber-900 shadow-md transition-all duration-150 py-2 flex items-center justify-center"
                >
                  <span className="mr-1">📝</span>
                  Request Project
                </button>
              </TooltipTrigger>
              <TooltipContent>Request a commission from this artist</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
export default ArtistActionsBar;
