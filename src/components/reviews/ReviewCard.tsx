import React from "react";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  clientName: string;
  clientAvatar?: string | null;
  rating: number;
  reviewText: string | null;
  createdAt: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  clientName,
  clientAvatar,
  rating,
  reviewText,
  createdAt,
}) => {
  return (
    <div className="bg-purple-50 rounded-lg px-5 py-4 border border-purple-100 shadow flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-1">
        <img
          src={clientAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50"}
          alt={clientName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-semibold text-sm text-purple-700">{clientName}</span>
        <span className="flex gap-0.5 ml-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </span>
      </div>
      {reviewText && (
        <p className="text-gray-700 italic">"{reviewText}"</p>
      )}
      <div className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>
    </div>
  );
};

export default ReviewCard;
