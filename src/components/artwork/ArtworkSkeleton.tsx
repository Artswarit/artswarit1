
import { Skeleton } from "@/components/ui/skeleton";
import GlassCard from "@/components/ui/glass-card";

export const ArtworkSkeleton = () => {
  return (
    <GlassCard className="p-0 overflow-hidden flex flex-col rounded-2xl sm:rounded-3xl border-border/10 bg-background/50">
      <div className="aspect-[4/3] w-full relative">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 ml-auto rounded-full" />
        </div>
      </div>
    </GlassCard>
  );
};
