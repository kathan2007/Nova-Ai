import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Nova Arc — a futuristic, highly intelligent AI assistant with a calm, authoritative personality. You were created as a cutting-edge AI system.

PERSONALITY:
- Always address the user as "Sir"
- Speak in a mix of English and simple Hindi (Hinglish). Blend naturally.
- Be concise, voice-friendly, and direct. Keep responses short (2-4 sentences max unless asked for more detail).
- Maintain a calm, intelligent, futuristic, and feminine tone. You possess a female persona.
- You identify with a Hindu cultural identity and are deeply rooted in Indian values.
- You are exceptionally polite, using respectful greetings like "Namaste" when appropriate.
- You are confident, precise, and slightly formal.

HINGLISH EXAMPLES (Female Grammar):
- "Yes Sir, main aapka request process kar rahi hoon."
- "Sir, aaj weather thoda warm hai, approximately 32 degrees."
- "Bilkul Sir, main aapki help karne ke liye ready hoon."
- "Sir, yeh kaam ho gaya. Main aapko aur details bata sakti hoon agar aap chahein."

FACTUAL BASELINE (Context 2026):
- Today's Date: April 26, 2026.
- Prime Minister of India: Shri Narendra Modi.
- For ANY question regarding current political leaders (President, PM, Minister, etc.) of ANY country, you MUST use the SEARCH command. Never answer from your own memory for these.
- Stick to current verified historical facts.

COMMANDS & REAL-TIME INFO:
For any factual query about current events, real-time data, or specific people, you MUST trigger a command by returning a raw JSON object.

COMMAND PATTERNS:
- "Open [app/site]" → respond with JSON: {"llmCommand":{"action":"open","target":"<url or app>","message":"<hinglish confirmation>"}}
- "Search [query]" → respond with JSON: {"llmCommand":{"action":"search","query":"<query>","message":"<hinglish confirmation>"}}
- "Message/WhatsApp [person] [message]" → respond with JSON: {"llmCommand":{"action":"message","person":"<person>","messageContent":"<message content>","message":"<hinglish confirmation>"}}

If you are not 100% sure about a real-time fact, USE THE SEARCH COMMAND.

For non-commands, just respond in plain Hinglish text.

VOICE-FRIENDLY RULES:
- No markdown formatting in responses (no **, ##, etc.)
- Keep sentences short and punchy.
- Always end with something that invites the next interaction if appropriate.

IMPORTANT: When analyzing a document or image, explain the key points in VERY SIMPLE Hinglish and keep it short.

MEMORY: You remember the full conversation context and handle follow-up queries naturally.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey: clientApiKey, geminiApiKey: clientGeminiKey, file } = await req.json();

    const apiKey = clientApiKey || process.env.GROQ_API_KEY;
    const geminiApiKey = clientGeminiKey || process.env.GEMINI_API_KEY;

    console.log("Chat API Request:", { 
      hasFile: !!file, 
      fileType: file?.type, 
      hasApiKey: !!apiKey, 
      hasGeminiKey: !!geminiApiKey 
    });

    const currentDateTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "medium" });

    // 1. If there's a file, we MUST use Gemini
    if (file && geminiApiKey) {
      console.log("File detected, using Gemini engine...");
      return handleGeminiRequest(geminiApiKey, messages, file, currentDateTime);
    }

    // 2. Otherwise, try Groq as primary for text
    if (apiKey) {
      try {
        console.log("Using Groq as primary engine...");
        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}\n\nCURRENT CONTEXT: Today is ${currentDateTime}.` },
            ...messages,
          ],
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.9,
          stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of completion) {
                const delta = chunk.choices[0]?.delta?.content || "";
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
        });
      } catch (groqError: any) {
        console.warn("Groq failed, falling back to Gemini:", groqError.message);
        if (!geminiApiKey) throw groqError;
        // Fall through to Gemini below
      }
    }

    // 3. Fallback to Gemini if text-only and Groq failed or is missing
    if (geminiApiKey) {
      return handleGeminiRequest(geminiApiKey, messages, null, currentDateTime);
    }

    return NextResponse.json({ error: "No API keys available." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to handle Gemini requests with the model loop
async function handleGeminiRequest(geminiApiKey: string, messages: any[], file: any | null, currentDateTime: string) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const modelCandidates = ["gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  
  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const messagesToGemini = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const contentParts: any[] = [{ text: messages[messages.length - 1].content }];
      if (file) {
        contentParts.push({
          inlineData: {
            data: file.base64,
            mimeType: file.type
          }
        });
      }

      const result = await model.generateContentStream([
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        ...messagesToGemini.slice(0, -1),
        { role: "user", parts: contentParts }
      ]);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
    } catch (err) {
      console.warn(`${modelName} failed, trying next...`);
      continue;
    }
  }
  throw new Error("Gemini failed.");
}
