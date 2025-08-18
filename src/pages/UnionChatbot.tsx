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

  return (
    <>
      {parts.map((part, index) => {
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
        if (part.type === "text") {
          // Split text and highlight only the resource names
          const resourceRegex =
            /(Big Red Book|TfL|Highway Code|Working Time Regulations|employment rights)/gi;
          const textParts = [];
          let lastIndex = 0;
          let match;
          let partIndex = 0;

          while ((match = resourceRegex.exec(part.content)) !== null) {
            // Add text before the resource
            if (match.index > lastIndex) {
              textParts.push(
                <span key={`text-${index}-${partIndex++}`}>
                  {part.content.slice(lastIndex, match.index)}
                </span>
              );
            }

            // Add the highlighted resource
            textParts.push(
              <span
                key={`resource-${index}-${partIndex++}`}
                className="font-medium text-green-600 dark:text-green-400"
              >
                {match[0]}
              </span>
            );

            lastIndex = match.index + match[0].length;
          }

          // Add remaining text after the last resource
          if (lastIndex < part.content.length) {
            textParts.push(
              <span key={`text-${index}-${partIndex++}`}>
                {part.content.slice(lastIndex)}
              </span>
            );
          }

          return textParts;
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
  // Custom chat state management to avoid useLocalStorage issues
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load from localStorage on component mount
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("chatMessages");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn("Failed to load chat messages from localStorage:", error);
      }
    }

    // Return default welcome message
    return [
      {
        sender: "bot",
        text: "Hello! I'm your AI ShiftPal. How can I help you today? You can ask me about your rights, pay, or union rules.\n\n💡 TIP: Green text highlights official resources and regulations mentioned in responses (e.g., Big Red Book, TfL, Highway Code).\n\n⚠️ DISCLAIMER: This AI provides general information only and should not be considered legal advice. Always consult official sources, your union representative, or legal professionals for specific situations. Information may not reflect the most current regulations.",
      },
    ];
  });
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

  // Custom function to save messages to localStorage
  const saveMessagesToStorage = (newMessages: ChatMessage[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("chatMessages", JSON.stringify(newMessages));
      } catch (error) {
        console.warn("Failed to save chat messages to localStorage:", error);
      }
    }
  };

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

    // Add user message to chat immediately and save to storage
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      saveMessagesToStorage(newMessages);
      return newMessages;
    });

    setInputValue("");
    setIsLoading(true);
    setLastMessageTime(now);

    try {
      // Get the current messages including the user message we just added
      const currentMessages = [...messages, userMessage];

      const responseText = await getChatbotResponse(
        currentMessages,
        sanitizedInput
      );

      const botMessage: ChatMessage = { sender: "bot", text: responseText };
      setMessages((prev) => {
        const newMessages = [...prev, botMessage];
        saveMessagesToStorage(newMessages);
        return newMessages;
      });
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: "bot",
        text: "Sorry, I am having trouble connecting. Please try again later.",
      };
      setMessages((prev) => {
        const newMessages = [...prev, errorMessage];
        saveMessagesToStorage(newMessages);
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the chat history? This action cannot be undone."
      )
    ) {
      const defaultMessage: ChatMessage[] = [
        {
          sender: "bot" as const,
          text: "Hello! I'm your AI ShiftPal. How can I help you today? You can ask me about your rights, pay, or union rules.\n\n💡 TIP: Green text highlights official resources and regulations mentioned in responses (e.g., Big Red Book, TfL, Highway Code).\n\n⚠️ DISCLAIMER: This AI provides general information only and should not be considered legal advice. Always consult official sources, your union representative, or legal professionals for specific situations. Information may not reflect the most current regulations.",
        },
      ];
      setMessages(defaultMessage);
      saveMessagesToStorage(defaultMessage);
    }
  };

  return (
    <div
      className={`h-full flex flex-col ${
        settings.darkMode ? "bg-gray-800" : "bg-[#FAF7F0]"
      }`}
    >
      {/* Fixed Clear Chat Button - Always visible when there are messages to clear */}
      {messages.length > 1 && (
        <div
          className={`sticky top-0 z-10 p-3 border-b ${
            settings.darkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-[#FAF7F0] border-slate-200"
          }`}
        >
          <div className="flex justify-center">
            <button
              onClick={clearChat}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              title="Clear chat history"
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>
      )}

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
