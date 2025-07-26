
import { memo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface TagManagerProps {
  title: string;
  description: string;
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  isEditing: boolean;
  colorClass?: string;
}

const TagManager = memo(({ title, description, tags, onAddTag, onRemoveTag, isEditing, colorClass = "bg-primary/10 text-primary" }: TagManagerProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = useCallback(() => {
    if (newTag.trim() !== "") {
      onAddTag(newTag.trim());
      setNewTag("");
    }
  }, [newTag, onAddTag]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleRemoveTag = useCallback((tag: string) => {
    onRemoveTag(tag);
  }, [onRemoveTag]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <div 
              key={tag} 
              className={`${colorClass} px-3 py-1 rounded-full text-sm flex items-center gap-1`}
            >
              <span>{tag}</span>
              {isEditing && (
                <button 
                  onClick={() => handleRemoveTag(tag)} 
                  className="hover:text-red-500"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyDown={handleKeyDown}
            />
            <Button type="button" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TagManager.displayName = "TagManager";

export default TagManager;
