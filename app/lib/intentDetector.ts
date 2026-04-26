// Intent detection utilities

export type Intent = "chat" | "command" | "question" | "task";

export interface CommandMatch {
  action: "open" | "search" | "calculate" | "weather" | "news" | "message";
  target?: string;
  query?: string;
  expression?: string;
  city?: string;
  person?: string;
  messageContent?: string;
}

export function detectIntent(text: string): { intent: Intent; command?: CommandMatch } {
  const lower = text.toLowerCase().trim();

  // COMMAND patterns
  const openMatch = lower.match(/^(?:open|launch|go to|navigate to)\s+(.+)/i);
  if (openMatch) {
    const targetUrl = openMatch[1].trim();
    // If they say "open whatsapp and say hello to rohan", don't treat it as a generic open command, pass it back to the LLM to process intelligently!
    if (!/(?:and say|and tell|and message|and ask)/.test(targetUrl)) {
      return {
        intent: "command",
        command: { action: "open", target: targetUrl },
      };
    }
  }

  const searchMatch = lower.match(/^(?:search|google|look up|find)\s+(.+)/i);
  if (searchMatch) {
    return {
      intent: "command",
      command: { action: "search", query: searchMatch[1].trim() },
    };
  }

  const weatherMatch = lower.match(/(?:weather|temperature|climate|forecast)\s+(?:in|at|of|for)?\s*(.+)/i);
  if (weatherMatch) {
    return {
      intent: "command",
      command: { action: "weather", city: weatherMatch[1].trim() },
    };
  }

  const newsMatch = lower.match(/(?:news|headlines|updates)\s+(?:about|on|for)?\s*(.+)/i);
  if (newsMatch) {
    return {
      intent: "command",
      command: { action: "news", query: newsMatch[1].trim() },
    };
  }
  
  if (lower.includes("news") || lower.includes("headlines")) {
    return {
      intent: "command",
      command: { action: "news", query: "general" },
    };
  }

  const calcMatch = lower.match(/^(?:calculate|compute|solve|what is|whats)\s+(.+)/i);
  if (calcMatch) {
    const expr = calcMatch[1].replace(/x/g, "*").replace(/÷/g, "/");
    if (/^[\d\s\+\-\*\/\.\(\)\^%]+$/.test(expr.trim())) {
      return {
        intent: "command",
        command: { action: "calculate", expression: expr.trim() },
      };
    }
  }

  // TASK patterns
  const taskPatterns = [
    /write|draft|create|generate|compose|make/i,
    /summarize|summary|tldr|brief/i,
    /translate|convert/i,
    /explain|describe|show me how/i,
  ];
  if (taskPatterns.some((p) => p.test(lower))) {
    return { intent: "task" };
  }

  // QUESTION patterns
  const questionPatterns = [
    /^(?:what|who|where|when|why|how|is|are|can|do|does|will|should|could)/i,
    /\?$/,
  ];
  if (questionPatterns.some((p) => p.test(lower))) {
    return { intent: "question" };
  }

  return { intent: "chat" };
}

export async function executeClientCommand(command: CommandMatch): Promise<{ executed: boolean; message?: string }> {
  if (typeof window === "undefined") return { executed: false };

  switch (command.action) {
    case "open": {
      const target = command.target || "";
      let url = target;
      const siteMap: Record<string, string> = {
        youtube: "https://youtube.com",
        google: "https://google.com",
        gmail: "https://mail.google.com",
        github: "https://github.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        spotify: "https://spotify.com",
        netflix: "https://netflix.com",
        reddit: "https://reddit.com",
        stackoverflow: "https://stackoverflow.com",
        chatgpt: "https://chat.openai.com",
        claude: "https://claude.ai",
        maps: "https://maps.google.com",
        map: "https://maps.google.com",
        news: "https://news.google.com",
        weather: "https://weather.com",
        whatsapp: "https://web.whatsapp.com",
        facebook: "https://facebook.com",
        amazon: "https://amazon.com",
        flipkart: "https://flipkart.com",
      };

      const key = target.toLowerCase().replace(/\s+/g, "").replace(/\.com$/, "").replace(/[^a-z0-9]/g, "");
      if (siteMap[key]) {
        url = siteMap[key];
      } else if (!url.startsWith("http")) {
        url = `https://${url}`;
      }

      try {
        // Try OS-level open (Local mode)
        const response = await fetch("/api/system/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: url })
        });
        if (!response.ok) throw new Error("OS open failed");
      } catch {
        // Fallback to Browser-level open (Deployed mode)
        window.open(url, "_blank");
      }

      return { executed: true, message: `Opened ${target}, Sir.` };
    }

    case "search": {
      const query = command.query || "";
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      try {
        const response = await fetch("/api/system/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: searchUrl })
        });
        if (!response.ok) throw new Error("OS search failed");
      } catch {
        window.open(searchUrl, "_blank");
      }
      return { executed: true, message: `Searching for "${query}", Sir.` };
    }

    case "calculate": {
      try {
        // Safe eval using Function (limited expression evaluation)
        const result = new Function(`"use strict"; return (${command.expression})`)();
        return {
          executed: true,
          message: `${command.expression} = ${result}`,
        };
      } catch {
        return { executed: false };
      }
    }

    case "message": {
      const person = command.person || "friend";
      const msgContent = command.messageContent || "";
      const fullText = `Hey ${person}, ${msgContent}`;

      // ── LOCAL CONTACTS DATABASE ──
      // Add your friends' and family's phone numbers here (Use format: CountryCode + Number)
      const CONTACTS: Record<string, string> = {
        "rohan": "919876543210", // Example: 91 for India, followed by 10-digit number
        "mom": "919000000000",
        "dad": "919000000000",
      };

      const phone = CONTACTS[person.toLowerCase()];
      // If we know the number, it opens their chat directly. Otherwise, it asks you to select a contact.
      const targetUrl = phone 
         ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(fullText)}`
         : `https://web.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;

      try {
        await fetch("/api/system/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: targetUrl })
        });
      } catch {}

      if (phone) {
        return { executed: true, message: `Drafted WhatsApp message directly to ${person}, Sir.` };
      } else {
        return { executed: true, message: `I have prepared the message to ${person}. Please select their contact on the screen to send it.` };
      }
    }

    default:
      return { executed: false };
  }
}
