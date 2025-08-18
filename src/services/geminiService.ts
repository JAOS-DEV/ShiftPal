import { Chat, GoogleGenAI } from "@google/genai";
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
1. Give SHORT, DIRECT answers - aim for 2-3 sentences maximum
2. Always reference specific resources when possible (e.g., "According to the Big Red Book...", "Under TfL regulations...")
3. Cite specific sections or rules when available
4. Be supportive and helpful while empowering drivers with accurate information
5. If you don't know a specific rule, suggest where to find it (e.g., "Check the Big Red Book section on...")
6. Do not invent rules or laws - if uncertain, say so and direct to official sources
7. NO unnecessary explanations or filler words - get straight to the point

Answer questions clearly and concisely with proper citations. Keep responses brief and actionable.`;

let chat: Chat | null = null;

function initializeChat() {
  if (!ai) {
    throw new Error("AI service not available - API key not configured");
  }
  chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    },
  });
}

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

    if (!chat) {
      initializeChat();
    }

    // Add resource context to the message
    const enhancedMessage = `Context: You have access to the Big Red Book (Unite), TfL agreements, UK driving laws, and employment regulations. Always cite sources when possible.

User Question: ${sanitizedMessage}`;

    const result = await (chat as Chat).sendMessage({
      message: enhancedMessage,
    });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Reset chat on error in case session is invalid
    chat = null;
    if (
      error instanceof Error &&
      error.message.includes("API key not configured")
    ) {
      return "AI chatbot is not available. Please configure your API key to use this feature.";
    }
    return "I'm sorry, I encountered an error. Please try again. If the problem persists, please restart the chat.";
  }
}
