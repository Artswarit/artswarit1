
import React from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => (
  <div className="flex flex-col gap-3 px-2 py-2 overflow-y-auto max-h-60">
    {messages.map((msg, i) =>
      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`rounded-lg px-4 py-2 text-sm max-w-[70%] ${msg.sender === "user"
          ? "bg-blue-100 text-blue-900"
          : "bg-white border text-gray-900"
        }`}>
          {msg.text}
        </div>
      </div>
    )}
  </div>
);

export default ChatMessages;
