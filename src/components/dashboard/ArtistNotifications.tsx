
import { useState } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, DollarSign, Award, MessageSquare } from "lucide-react";

interface ArtistNotificationsProps {
  isLoading: boolean;
}

// Sample notification data
const NOTIFICATION_DATA = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    message: "You've received a payment of ₹4,500 for 'Mystic Mountains'",
    timestamp: "2023-11-15T14:30:00",
    isRead: false
  },
  {
    id: "2",
    type: "comment",
    title: "New Comment",
    message: "Priya Sharma commented on your artwork 'Urban Dreams'",
    timestamp: "2023-11-14T09:15:00",
    isRead: false
  },
  {
    id: "3",
    type: "achievement",
    title: "Milestone Reached",
    message: "Congratulations! Your artwork 'Ambient Waves' has reached 1,000 views",
    timestamp: "2023-11-12T16:45:00",
    isRead: false
  },
  {
    id: "4",
    type: "admin",
    title: "From Artswarit Team",
    message: "Your application for featured artist status is being reviewed",
    timestamp: "2023-11-10T11:20:00",
    isRead: true
  },
  {
    id: "5",
    type: "payment",
    title: "Payment Received",
    message: "You've received a payment of ₹3,800 for 'Digital Renaissance'",
    timestamp: "2023-11-08T13:50:00",
    isRead: true
  },
  {
    id: "6",
    type: "comment",
    title: "New Comment",
    message: "Ankit Patel commented on your artwork 'Ocean Dreams'",
    timestamp: "2023-11-05T17:30:00",
    isRead: true
  },
  {
    id: "7",
    type: "achievement",
    title: "Milestone Reached",
    message: "Your profile has reached 500 followers! Keep up the great work",
    timestamp: "2023-11-02T10:15:00",
    isRead: true
  }
];

const ArtistNotifications = ({ isLoading }: ArtistNotificationsProps) => {
  const [notifications, setNotifications] = useState(NOTIFICATION_DATA);
  const [activeTab, setActiveTab] = useState("all");
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filterNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === activeTab);
  };
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "achievement":
        return <Award className="h-4 w-4 text-amber-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "admin":
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

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
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap md:justify-start">
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
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
            <div className="divide-y">
              {filterNotifications().length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No notifications found</p>
                </div>
              ) : (
                filterNotifications().map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`px-6 py-4 hover:bg-muted/50 ${!notification.isRead ? "bg-muted/30" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          {filterNotifications().length > 0 && (
            <CardFooter className="border-t p-4 flex justify-center">
              <Button variant="outline" className="w-full md:w-auto">Load More</Button>
            </CardFooter>
          )}
        </Card>
      </Tabs>
    </div>
  );
};

export default ArtistNotifications;
