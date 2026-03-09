
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
    <Card className="rounded-[2rem] border-border/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-md overflow-hidden">
      <CardHeader className="p-6 sm:p-10 border-b border-border/10">
        <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm font-medium">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-10">
        <div className="flex flex-wrap gap-3 mb-8">
          {tags.map((tag) => (
            <div 
              key={tag} 
              className={`${colorClass} pl-4 pr-1.5 py-1.5 rounded-xl text-xs flex items-center gap-2 font-black uppercase tracking-widest shadow-sm border border-current/10 group transition-all hover:scale-[1.05]`}
            >
              <span>{tag}</span>
              {isEditing && (
                <button 
                  onClick={() => handleRemoveTag(tag)} 
                  className="hover:bg-red-500 hover:text-white rounded-lg p-1.5 transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
                  type="button"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {tags.length === 0 && (
            <div className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest py-4">No tags added yet</div>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-3">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a new tag..."
              onKeyDown={handleKeyDown}
              className="h-14 rounded-xl border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-base font-bold transition-all"
            />
            <Button 
              type="button" 
              onClick={handleAddTag}
              className="h-14 w-14 rounded-xl shrink-0 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TagManager.displayName = "TagManager";

export default TagManager;
