
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X, MessageCircle, Heart, Users } from "lucide-react";

const ArtistNotifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: "like",
      title: "New Like on Your Artwork",
      message: "Sarah liked your artwork 'Abstract Dreams'",
      time: "2 hours ago",
      isRead: false,
      icon: Heart
    },
    {
      id: 2,
      type: "comment",
      title: "New Comment",
      message: "John commented on your artwork 'Digital Landscape'",
      time: "5 hours ago",
      isRead: false,
      icon: MessageCircle
    },
    {
      id: 3,
      type: "follow",
      title: "New Follower",
      message: "Mike started following you",
      time: "1 day ago",
      isRead: true,
      icon: Users
    }
  ]);

  const markAllAsRead = () => {
    console.log("Marking all notifications as read");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <Card key={notification.id} className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && <Badge variant="secondary">New</Badge>}
                        <span className="text-sm text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistNotifications;
