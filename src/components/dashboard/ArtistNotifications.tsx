import { useState, useEffect, useCallback } from "react";
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, DollarSign, Award, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ArtistNotificationsProps {
  isLoading: boolean;
}

const ArtistNotifications = ({ isLoading }: ArtistNotificationsProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-realtime:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Notifications realtime update received');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchNotifications]);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const filterNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === activeTab);
  };
  
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case "achievement":
        return <Award className="h-4 w-4 text-amber-500" />;
      case "comment":
      case "like":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "admin":
        return <Bell className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
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

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1">
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
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="like">Likes</TabsTrigger>
          <TabsTrigger value="comment">Comments</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {activeTab === "all" && "All Notifications"}
              {activeTab === "unread" && "Unread Notifications"}
              {activeTab === "payment" && "Payment Notifications"}
              {activeTab === "like" && "Like Notifications"}
              {activeTab === "comment" && "Comment Notifications"}
            </CardTitle>
            <CardDescription>
              {activeTab === "all" 
                ? "All notifications from payments, likes, and comments" 
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
                    className={`px-6 py-4 hover:bg-muted/50 cursor-pointer ${!notification.is_read ? "bg-muted/30" : ""}`}
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
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary"></div>
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
