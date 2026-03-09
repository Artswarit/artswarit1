import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, DollarSign, Shield, AlertTriangle, ScrollText
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Governance modules
import DisputeSettlement from './DisputeSettlement';
import ContentModeration from './ContentModeration';
import UserGovernance from './UserGovernance';
import AuditLog from './AuditLog';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  // Trigger a window resize event to ensure any responsive components inside tabs adjust correctly when opened
  useEffect(() => {
    const handleResize = () => window.dispatchEvent(new Event('resize'));
    handleResize();
  }, [activeTab]);

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Standard Platform Heading */}
      <div className="mb-4 sm:mb-6 lg:mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black mb-1 sm:mb-2 flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Compliance & Governance
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
            Manual administration · RBI 2026 · IT Rules 2021 · Live sync
          </p>
        </div>
        <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 px-4 py-1.5 font-bold rounded-full tracking-wide text-xs w-fit">
          System Admin
        </Badge>
      </div>

      {/* Standard Platform Responsive Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4 sm:mb-6 lg:mb-8">
        <div className="relative mb-4 sm:mb-6 group">
          <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-4">
            <TabsList className="bg-white/80 dark:bg-card/80 backdrop-blur-md inline-flex sm:flex sm:flex-wrap lg:grid lg:grid-cols-4 gap-2 p-1.5 rounded-[1.5rem] shadow-xl border border-border/40 min-w-full sm:min-w-0 h-auto min-h-[80px] sm:min-h-0">
              
              <TabsTrigger 
                value="users" 
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30",
                  "hover:bg-primary/5 hover:text-primary data-[state=inactive]:text-muted-foreground font-bold sm:font-medium"
                )}
              >
                <Users className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                User Governance
              </TabsTrigger>
              
              <TabsTrigger 
                value="disputes" 
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30",
                  "hover:bg-primary/5 hover:text-primary data-[state=inactive]:text-muted-foreground font-bold sm:font-medium"
                )}
              >
                <DollarSign className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                Financial Disputes
              </TabsTrigger>
              
              <TabsTrigger 
                value="takedown" 
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30",
                  "hover:bg-primary/5 hover:text-primary data-[state=inactive]:text-muted-foreground font-bold sm:font-medium"
                )}
              >
                <AlertTriangle className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                Priority Takedowns
              </TabsTrigger>
              
              <TabsTrigger 
                value="audit" 
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm px-3 sm:px-6 py-3.5 sm:py-3 rounded-2xl transition-all duration-300 snap-center flex-1 sm:flex-initial min-w-[85px] sm:min-w-0",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30",
                  "hover:bg-primary/5 hover:text-primary data-[state=inactive]:text-muted-foreground font-bold sm:font-medium"
                )}
              >
                <ScrollText className="h-5 w-5 sm:h-4.5 sm:w-4.5" />
                Compliance Audit
              </TabsTrigger>
  
            </TabsList>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <TabsContent value="users" className="m-0 border-none outline-none focus-visible:ring-0">
            <UserGovernance />
          </TabsContent>
          
          <TabsContent value="disputes" className="m-0 border-none outline-none focus-visible:ring-0">
            <DisputeSettlement />
          </TabsContent>
          
          <TabsContent value="takedown" className="m-0 border-none outline-none focus-visible:ring-0">
            <ContentModeration />
          </TabsContent>
          
          <TabsContent value="audit" className="m-0 border-none outline-none focus-visible:ring-0">
            <AuditLog />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
