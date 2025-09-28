import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell } from "lucide-react";

interface ArtistNotificationsProps {
  isLoading: boolean;
}

const ArtistNotifications = ({ isLoading }: ArtistNotificationsProps) => {
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        
        <Button 
          variant="ghost" 
          disabled={true}
        >
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap md:justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="comment">Comments</TabsTrigger>
          <TabsTrigger value="achievement">Milestones</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {activeTab === "all" && "All Notifications"}
              {activeTab === "unread" && "Unread Notifications"}
              {activeTab === "payment" && "Payment Notifications"}
              {activeTab === "comment" && "Comment Notifications"}
              {activeTab === "achievement" && "Milestone Notifications"}
              {activeTab === "admin" && "Admin Notifications"}
            </CardTitle>
            <CardDescription>
              {activeTab === "all" 
                ? "All notifications from payments, comments, and milestones" 
                : `Showing ${activeTab === "unread" ? "unread" : activeTab} notifications`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="py-16 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">You'll see notifications here when you receive payments, comments, or reach milestones</p>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ArtistNotifications;