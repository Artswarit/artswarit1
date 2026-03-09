import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Briefcase, CheckCircle, Clock, XCircle, 
  Timer, Activity
} from "lucide-react";

interface ClientWorkHistoryProps {
  stats: {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    cancelledProjects: number;
    avgResponseTime: string | null;
    lastActive: string | null;
  };
}

const ClientWorkHistory: React.FC<ClientWorkHistoryProps> = ({ stats }) => {
  const completionRate = stats.totalProjects > 0 
    ? Math.round((stats.completedProjects / stats.totalProjects) * 100) 
    : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          Work History & Reliability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Projects */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">{stats.totalProjects}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total Requests</p>
          </div>

          {/* Completed */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xl font-bold text-green-600">{stats.completedProjects}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Completed</p>
          </div>

          {/* In Progress */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.inProgressProjects}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">In Progress</p>
          </div>

          {/* Cancelled */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xl font-bold text-red-600">{stats.cancelledProjects}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Cancelled</p>
          </div>

          {/* Response Time */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-600">{stats.avgResponseTime || 'N/A'}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Response</p>
          </div>

          {/* Completion Rate */}
          <div className="text-center p-3 bg-muted/30 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-purple-600">{completionRate}%</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Completion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientWorkHistory;
