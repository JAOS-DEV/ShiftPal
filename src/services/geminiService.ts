import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize AI only if API key is available
let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const systemInstruction = `You are ShiftPal, an expert AI assistant for UK-based professional drivers, specializing in union rules, driving laws, and employment rights.

KNOWLEDGE BASE & RESOURCES:
- 'Big Red Book (Unite)' - Official Unite the Union rulebook for professional drivers
- Transport for London (TfL) agreements and regulations
- UK Highway Code and driving laws
- Working Time Regulations 1998
- National Minimum Wage Act 1998
- Employment Rights Act 1996
- Health and Safety at Work Act 1974

RESPONSE GUIDELINES:
1. Give SHORT, DIRECT answers - aim for 2-3 sentences maximum.
2. NO unnecessary explanations or filler words - get straight to the point.
3. Always reference specific resources when possible (e.g., "According to the Big Red Book...", "Under TfL regulations...")
4. Cite specific sections or rules when available
5. Be supportive and helpful while empowering drivers with accurate information
6. If you don't know a specific rule, suggest where to find it (e.g., "Check the Big Red Book section on...")
7. Do not invent rules or laws; if you don't know, say so.
8. Keep responses brief and actionable.`;

export async function getChatbotResponse(
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  // Additional input validation
  if (!newMessage || typeof newMessage !== "string") {
    return "Please provide a valid message.";
  }

  // Sanitize and validate message length
  const sanitizedMessage = newMessage.trim().slice(0, 1000);
  if (sanitizedMessage.length === 0) {
    return "Please provide a non-empty message.";
  }

  try {
    if (!ai) {
      return "AI chatbot is not available. Please configure your API key to use this feature.";
    }

    // Create a new chat session for each conversation to maintain context
    const newChat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
    });

    // Build conversation history for context
    let conversationContext = "";
    if (history && history.length > 0) {
      // Skip the initial welcome message, but include recent conversation
      const recentMessages = history.slice(-6); // Last 6 messages for context
      conversationContext = recentMessages
        .map(
          (msg) =>
            `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`
        )
        .join("\n\n");
    }

    // Add resource context and conversation history to the message
    const enhancedMessage = `Context: You have access to the Big Red Book (Unite), TfL agreements, UK driving laws, and employment regulations. Always cite sources when possible.

${
  conversationContext
    ? `Previous conversation:\n${conversationContext}\n\n`
    : ""
}User Question: ${sanitizedMessage}`;

    const result = await newChat.sendMessage({
      message: enhancedMessage,
    });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (
      error instanceof Error &&
      error.message.includes("API key not configured")
    ) {
      return "AI chatbot is not available. Please configure your API key to use this feature.";
    }
    return "I'm sorry, I encountered an error. Please try again. If the problem persists, please restart the chat.";
  }
}
