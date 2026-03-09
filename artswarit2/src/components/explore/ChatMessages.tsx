
import React from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

interface ChatMessagesProps {
  messages: Message[];
}

// Minimal Markdown-like to JSX renderer (support bold + links)
function renderTextWithSimpleMarkdown(text: string) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;

  // Replace links
  let parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Process links
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <a key={`${match[2]}-${match.index}`} href={match[2]} className="text-blue-700 underline hover:text-blue-900" target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Now process bold in each part (that is a string)
  const finalParts = parts.flatMap((p, i) => {
    if (typeof p === "string") {
      const subParts: (string | JSX.Element)[] = [];
      let subLast = 0;
      let m: RegExpExecArray | null;
      while ((m = boldRegex.exec(p)) !== null) {
        if (m.index > subLast) {
          subParts.push(p.substring(subLast, m.index));
        }
        subParts.push(
          <strong key={`bold-${i}-${m.index}`} className="font-semibold">{m[1]}</strong>
        );
        subLast = m.index + m[0].length;
      }
      if (subLast < p.length) {
        subParts.push(p.substring(subLast));
      }
      return subParts;
    }
    return p;
  });
  return finalParts;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => (
  <div className="flex flex-col gap-3 px-2 py-2 overflow-y-auto max-h-60">
    {messages.map((msg, i) =>
      <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
        <div className={`rounded-lg px-4 py-2 text-sm max-w-[70%] whitespace-pre-line ${msg.sender === "user"
          ? "bg-blue-100 text-blue-900"
          : "bg-white border text-gray-900"
        }`}>
          {renderTextWithSimpleMarkdown(msg.text)}
        </div>
      </div>
    )}
  </div>
);

export default ChatMessages;
