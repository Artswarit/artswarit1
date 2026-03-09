
import React from "react";

interface TagDisplayProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

const TagDisplay: React.FC<TagDisplayProps> = ({ tags, onTagClick }) => {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 my-2">
      {tags.map((tag) => (
        <button
          className="bg-gradient-to-r from-purple-200 to-blue-100 text-purple-800 px-3 py-1 rounded-full text-xs shadow hover:bg-purple-300/40 transition"
          key={tag}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagDisplay;
