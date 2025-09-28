import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchIcon, MessageCircle } from "lucide-react";

const MessagingModule = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 flex border rounded-lg overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-full sm:w-80 border-r bg-white">
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search contacts" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(80vh-73px)]">
            <div className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start by messaging a client or another artist</p>
            </div>
          </ScrollArea>
        </div>
        
        {/* Message area */}
        <div className="flex-1 flex flex-col bg-gray-50 hidden sm:flex">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Choose a contact to start messaging</h3>
              <p className="text-sm text-gray-500">Select a conversation from the sidebar to begin chatting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModule;