import React, { useEffect, useRef, useState } from "react";
import { getChatbotResponse } from "../services/geminiService";
import { ChatMessage, Settings } from "../types";

// Utility function to detect URLs in text
const detectUrls = (
  text: string
): Array<{ type: "text" | "url"; content: string; url?: string }> => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({
        type: "text" as const,
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the URL
    parts.push({
      type: "url" as const,
      content: match[0],
      url: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push({
      type: "text" as const,
      content: text.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text" as const, content: text }];
};

// Component to safely render text with clickable links
const SafeTextRenderer: React.FC<{ text: string; darkMode?: boolean }> = ({
  text,
  darkMode = false,
}) => {
  const parts = detectUrls(text);

  // Enhanced to detect resource references
  const enhancedParts = parts.map((part) => {
    if (part.type === "text") {
      // Highlight resource references
      const resourceRegex =
        /(Big Red Book|TfL|Highway Code|Working Time Regulations|employment rights)/gi;
      const resourceMatches = part.content.match(resourceRegex);

      if (resourceMatches) {
        return {
          type: "resource" as const,
          content: part.content,
          resources: resourceMatches,
        };
      }
    }
    return part;
  });

  return (
    <>
      {enhancedParts.map((part, index) => {
        if (part.type === "url" && part.url) {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                darkMode
                  ? "text-blue-400 underline hover:text-blue-300"
                  : "text-blue-600 underline hover:text-blue-800"
              }
            >
              {part.content}
            </a>
          );
        }
        if (part.type === "resource") {
          return (
            <span
              key={index}
              className="font-medium text-green-600 dark:text-green-400"
            >
              {part.content}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </>
  );
};

interface UnionChatbotProps {
  settings: Settings;
}

const UnionChatbot: React.FC<UnionChatbotProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Hello! I'm your AI ShiftPal. How can I help you today? You can ask me about your rights, pay, or union rules.\n\n⚠️ DISCLAIMER: This AI provides general information only and should not be considered legal advice. Always consult official sources, your union representative, or legal professionals for specific situations. Information may not reflect the most current regulations.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Input sanitization function
  const sanitizeInput = (input: string): string => {
    return input.trim().slice(0, 1000); // Limit length to 1000 characters
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Rate limiting: prevent messages faster than 1 second apart
    const now = Date.now();
    const RATE_LIMIT_MS = 1000; // 1 second between messages
    if (now - lastMessageTime < RATE_LIMIT_MS) {
      return; // Ignore rapid messages
    }

    const sanitizedInput = sanitizeInput(inputValue);
    const userMessage: ChatMessage = { sender: "user", text: sanitizedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setLastMessageTime(now);

    try {
      const responseText = await getChatbotResponse(messages, inputValue);
      const botMessage: ChatMessage = { sender: "bot", text: responseText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: "bot",
        text: "Sorry, I am having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`h-full flex flex-col ${
        settings.darkMode ? "bg-gray-800" : "bg-[#FAF7F0]"
      }`}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                msg.sender === "user"
                  ? settings.darkMode
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-white rounded-br-none"
                  : settings.darkMode
                  ? "bg-gray-700 text-gray-100 border border-gray-600 rounded-bl-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {msg.sender === "bot" ? (
                  <SafeTextRenderer
                    text={msg.text}
                    darkMode={settings.darkMode}
                  />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-none border ${
                settings.darkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-white text-slate-800 border-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s] ${
                    settings.darkMode ? "bg-gray-400" : "bg-slate-400"
                  }`}
                ></div>
                <div
                  className={`h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s] ${
                    settings.darkMode ? "bg-gray-400" : "bg-slate-400"
                  }`}
                ></div>
                <div
                  className={`h-2 w-2 rounded-full animate-bounce ${
                    settings.darkMode ? "bg-gray-400" : "bg-slate-400"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div
        className={`p-4 border-t ${
          settings.darkMode
            ? "bg-gray-800 border-gray-600"
            : "bg-[#FAF7F0] border-slate-200"
        }`}
      >
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your rights, union rules, or driving laws..."
            className={`flex-1 p-2.5 border rounded-full focus:ring-2 focus:ring-gray-600 focus:border-gray-600 outline-none text-sm ${
              settings.darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`rounded-full p-2.5 disabled:cursor-not-allowed transition-colors ${
              settings.darkMode
                ? "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600"
                : "bg-gray-700 text-white hover:bg-gray-600 disabled:bg-slate-400"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnionChatbot;
