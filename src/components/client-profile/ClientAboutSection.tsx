import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Briefcase, Target, Clock, 
  MessageSquare, CheckSquare
} from "lucide-react";

interface ClientAboutSectionProps {
  bio: string | null;
  projectTypes: string[];
  workingStyle: string | null;
}

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ 
  bio, 
  projectTypes,
  workingStyle
}) => {
  // Default project types based on common patterns
  const defaultProjectTypes = ['Digital Art', 'Illustration', 'Design'];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          About This Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio */}
        {bio ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary/70" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              {bio}
            </p>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bio provided</p>
          </div>
        )}

        {/* Project Types */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary/70" />
            Typical Project Requests
          </h4>
          <div className="flex flex-wrap gap-2 pl-6">
            {(projectTypes.length > 0 ? projectTypes : defaultProjectTypes).map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Working Style & Expectations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary/70" />
              What to Expect
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Clear project briefs with detailed requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Professional communication throughout</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Timely feedback on deliverables</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-muted/20 rounded-lg space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary/70" />
              Communication Style
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{workingStyle || 'Prefers messaging for updates'}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>File sharing enabled</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Open to revisions within scope</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientAboutSection;
