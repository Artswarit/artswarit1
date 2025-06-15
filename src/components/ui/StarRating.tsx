
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  count?: number;
  rating: number;
  onRatingChange: (rating: number) => void;
  className?: string;
  starClassName?: string;
  readOnly?: boolean;
}

export function StarRating({
  count = 5,
  rating,
  onRatingChange,
  className,
  starClassName,
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readOnly) return;
    onRatingChange(index);
  };

  return (
    <div className={cn("flex items-center", className)}>
      {stars.map((index) => (
        <Star
          key={index}
          className={cn(
            'w-5 h-5 transition-colors',
            (hoverRating || rating) >= index ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            readOnly ? 'cursor-default' : 'cursor-pointer',
            starClassName
          )}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}
