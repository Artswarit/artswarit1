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
import { broadcastRefresh, useRealtimeSync } from "@/lib/realtime-sync";

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

const ITEMS_PER_PAGE = 10;

const ArtistNotifications = ({ isLoading }: ArtistNotificationsProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Realtime Sync
  useRealtimeSync('notifications', fetchNotifications);

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
    let filtered = notifications;
    if (activeTab === "unread") {
      filtered = notifications.filter(n => !n.is_read);
    } else if (activeTab !== "all") {
      filtered = notifications.filter(n => n.type === activeTab);
    }
    return filtered;
  };

  const displayedNotifications = filterNotifications().slice(0, displayCount);
  const hasMore = filterNotifications().length > displayCount;

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 300);
  };

  // Reset display count when tab changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [activeTab]);
  
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      broadcastRefresh('notifications');
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
      broadcastRefresh('notifications');
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
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-bold rounded-full px-2 py-0.5 sm:py-1">
              {unreadCount} new
            </span>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-xs sm:text-sm h-11 sm:h-9"
        >
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="mb-6 w-full h-auto min-h-[52px] sm:min-h-0 p-1 bg-muted/50 rounded-xl flex flex-nowrap md:justify-start gap-1">
            <TabsTrigger 
              value="all" 
              className="flex-1 md:flex-none min-w-[80px] min-h-[44px] sm:min-h-[40px] px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              All
              {unreadCount > 0 && (
                <span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="flex-1 md:flex-none min-w-[80px] min-h-[44px] sm:min-h-[40px] px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="flex-1 md:flex-none min-w-[80px] min-h-[44px] sm:min-h-[40px] px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="like" 
              className="flex-1 md:flex-none min-w-[80px] min-h-[44px] sm:min-h-[40px] px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Likes
            </TabsTrigger>
            <TabsTrigger 
              value="comment" 
              className="flex-1 md:flex-none min-w-[80px] min-h-[44px] sm:min-h-[40px] px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              Comments
            </TabsTrigger>
          </TabsList>
        </div>
        
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
            <div className="divide-y divide-border/50">
              {displayedNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground font-medium">No notifications found</p>
                </div>
              ) : (
                displayedNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`px-4 sm:px-6 py-4 sm:py-5 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.is_read ? "bg-primary/[0.03]" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="mt-1 p-2 bg-muted/50 rounded-lg shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-sm sm:text-base font-semibold leading-tight truncate ${!notification.is_read ? "text-foreground" : "text-foreground/70"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap font-medium">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          {hasMore && (
            <CardFooter className="border-t border-border/50 p-4 sm:p-6 flex justify-center bg-muted/5">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[40px] font-bold uppercase tracking-wider text-xs"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </Tabs>
    </div>
  );
};

export default ArtistNotifications;
