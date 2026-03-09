import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';

const MessageBadge = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { unreadCount } = useUnreadMessagesCount();

  if (!user) return null;

  const dashboardPath = isAdmin 
    ? "/admin-dashboard" 
    : user.user_metadata?.role === "artist" 
      ? "/artist-dashboard/messages" 
      : "/client-dashboard?tab=messages";

  return (
    <Link to={dashboardPath}>
      <Button variant="ghost" className="relative h-8 w-8 p-0">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default MessageBadge;
