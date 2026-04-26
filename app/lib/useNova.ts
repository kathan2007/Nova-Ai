"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "../components/ChatPanel";
import { OrbState } from "../components/NovaOrb";
import { sounds, startAmbient } from "./audioEngine";
import { detectIntent, executeClientCommand } from "./intentDetector";

interface UseNovaOptions {
  groqApiKey: string;
  geminiApiKey?: string;
}

const WAKE_WORDS = ["nova arc", "nova arc,", "nova arc.", "nova", "nova,", "nova."];

function generateId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// Browser speech recognition type shim
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useNova({ groqApiKey, geminiApiKey }: UseNovaOptions) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nova_chat_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        } catch { return []; }
      }
    }
    return [];
  });

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("nova_chat_history", JSON.stringify(messages));
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem("nova_chat_history");
  }, []);
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusText, setStatusText] = useState("STANDBY");
  const [wakeWordActive, setWakeWordActive] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const pendingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const hasGreeted = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const full: Message = { ...msg, id: generateId(), timestamp: new Date() };
    setMessages((prev) => [...prev, full]);
    return full.id;
  }, []);

  const updateLastAssistantMessage = useCallback((id: string, content: string, streaming = false) => {
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, content, streaming } : m)
    );
  }, []);

  // ─── Browser fallback TTS ────────────────────────────────────────────────
  const browserSpeak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) { resolve(); return; }
      
      // Temporarily shut down the microphone so she doesn't hear herself and crash the Web Speech buffer!
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      isSpeakingRef.current = true;
      setIsSpeaking(true);

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = "hi-IN";
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) =>
        v.lang === "hi-IN" && v.name.toLowerCase().includes("female")
      );
      utterance.voice = hindiVoice || voices.find(v => v.lang === "hi-IN") || null;

      utterance.onend = () => {
        setIsSpeaking(false);
        // Larger delay to allow room echo to fully dissipate (Common Windows mic issue)
        setTimeout(() => {
          isSpeakingRef.current = false;
          if (isListeningRef.current && recognitionRef.current) {
            try { recognitionRef.current!.start(); } catch {}
          }
          resolve();
        }, 1500); 
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          isSpeakingRef.current = false;
          if (isListeningRef.current && recognitionRef.current) {
            try { recognitionRef.current!.start(); } catch {}
          }
          resolve();
        }, 1500);
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ─── TTS: Browser Native Only ──────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const cleanText = text
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/[*#`_]/g, "")
      .trim();

    if (!cleanText) return;

    setOrbState("speaking");
    setIsSpeaking(true);
    setStatusText("RESPONDING");
    sounds.responseStart();

    await browserSpeak(cleanText);

    setOrbState("idle");
    setIsSpeaking(false);
    setStatusText("STANDBY");
  }, [browserSpeak]);

  // ─── Core send message ──────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string, file?: File) => {
    if (pendingRef.current || (!text.trim() && !file)) return;
    pendingRef.current = true;

    sounds.commandReceived();
    if (!ambientStarted.current) {
      startAmbient();
      ambientStarted.current = true;
    }

    const { intent, command } = detectIntent(text);

    // Display message in UI
    addMessage({ 
      role: "user", 
      content: text || (file ? `Checking document: ${file.name}` : ""), 
      intent 
    });
    
    // Update ref for conversation history
    conversationRef.current.push({ 
      role: "user", 
      content: text || (file ? `Checking document: ${file.name}` : "") 
    });

    // ── Client-side commands ──
    if (!file && command && ["open", "search", "calculate", "message"].includes(command.action)) {
      const result = await executeClientCommand(command);
      if (result.executed && result.message) {
        const aiMsg = `Yes Sir, ${result.message}`;
        addMessage({ role: "assistant", content: aiMsg, intent: "command" });
        conversationRef.current.push({ role: "assistant", content: aiMsg });
        pendingRef.current = false;
        await speak(aiMsg);
        return;
      }
    }

    // ── Weather command ──
    if (!file && command?.action === "weather" && command.city) {
      setOrbState("thinking");
      setIsThinking(true);
      setStatusText("FETCHING WEATHER");
      try {
        const resp = await fetch(`/api/weather?city=${encodeURIComponent(command.city)}`);
        const data = await resp.json();
        const temp = data.temp_c;
        const weatherMsg = `Sir, ${data.city} mein abhi ${temp}°C temperature hai. ${data.condition} conditions hain, humidity ${data.humidity}% hai. ${temp > 35 ? "Bahut garmi hai Sir, stay hydrated." : temp < 15 ? "Thanda weather hai Sir, jacket zaroor lena." : "Kaafi pleasant day hai Sir."}`;
        setIsThinking(false);
        addMessage({ role: "assistant", content: weatherMsg, intent: "command" });
        conversationRef.current.push({ role: "assistant", content: weatherMsg });
        pendingRef.current = false;
        await speak(weatherMsg);
        return;
      } catch {
        setIsThinking(false);
      }
    }

    // ── News command ──
    if (!file && command?.action === "news" && command.query) {
      setOrbState("thinking");
      setIsThinking(true);
      setStatusText("FETCHING NEWS");
      try {
        const resp = await fetch(`/api/news?query=${encodeURIComponent(command.query)}`);
        const data = await resp.json();
        
        let newsMsg = "";
        if (data.articles && data.articles.length > 0) {
          newsMsg = `Sir, here are the top headlines for ${command.query}. `;
          data.articles.forEach((art: any, idx: number) => {
            newsMsg += `${idx + 1}. ${art.title} (from ${art.source}). `;
          });
          newsMsg += "That concludes the news update.";
        } else {
          newsMsg = `Sir, I couldn't find any recent news for ${command.query}.`;
        }
        
        setIsThinking(false);
        addMessage({ role: "assistant", content: newsMsg, intent: "command" });
        conversationRef.current.push({ role: "assistant", content: newsMsg });
        pendingRef.current = false;
        await speak(newsMsg);
        return;
      } catch {
        setIsThinking(false);
      }
    }

    setOrbState("thinking");
    setIsThinking(true);
    setStatusText(file ? "ANALYZING DOCUMENT" : "PROCESSING");

    let assistantMsgId = "";
    let fullResponse = "";

    try {
      let fileData = null;
      if (file) {
        // Convert file to base64
        const fileReader = new FileReader();
        fileData = await new Promise((resolve) => {
          fileReader.onload = () => {
            const result = fileReader.result as string;
            resolve({
              name: file.name,
              type: file.type,
              base64: result.split(",")[1],
            });
          };
          fileReader.readAsDataURL(file);
        });
      }

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationRef.current.slice(-20),
          apiKey: groqApiKey,
          geminiApiKey,
          file: fileData,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `API ${resp.status}`);
      }

      setIsThinking(false);
      setOrbState("speaking");
      setStatusText("STREAMING");

      assistantMsgId = addMessage({ role: "assistant", content: "", intent, streaming: true });

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  
                  // LIVE FILTER: Hide anything that looks like JSON from the UI during streaming
                  let uiText = fullResponse;
                  const firstBrace = fullResponse.indexOf("{");
                  if (firstBrace !== -1 && fullResponse.includes("llmCommand")) {
                    uiText = fullResponse.substring(0, firstBrace).trim();
                  }
                  
                  updateLastAssistantMessage(assistantMsgId, uiText, true);
                } else if (parsed.llmCommand) {
                  // Some backends might send command directly as a chunk
                  // Proceed as usual
                }
              } catch { /* skip */ }
            }
          }
        }
      }

      updateLastAssistantMessage(assistantMsgId, fullResponse, false);

      let finalSpokenText = fullResponse;
      let uiDisplayContent = fullResponse;

      // Try to extract JSON from anywhere in the response
      const jsonMatch = fullResponse.match(/\{[\s\S]*"llmCommand"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const cmd = parsed.llmCommand || parsed;
          
          // Support multiple key names for the message
          const msg = cmd.message || cmd.answer || cmd.content || cmd.messageContent || "";
          
          if (msg || cmd.action) {
            finalSpokenText = msg || `Executing ${cmd.action}`;
            
            // Separate the pre-JSON text and the command message
            const textBeforeJson = fullResponse.split(jsonMatch[0])[0].trim();
            uiDisplayContent = textBeforeJson ? `${textBeforeJson}\n\n${msg}` : msg;
            
            // Update UI to show clean text
            setMessages((prev) => {
              const newMessages = [...prev];
              const last = newMessages[newMessages.length - 1];
              if (last && last.id === assistantMsgId) {
                last.content = uiDisplayContent || "Processing...";
                last.intent = "command"; // Mark as command
              }
              return newMessages;
            });

            // Execute the action
            if (cmd.action === "open" && cmd.target) {
              await executeClientCommand({ action: "open", target: cmd.target });
            } else if (cmd.action === "search" && cmd.query) {
              await executeClientCommand({ action: "search", query: cmd.query });
            } else if (cmd.action === "message" && cmd.person) {
              await executeClientCommand({ 
                action: "message", 
                person: cmd.person, 
                messageContent: cmd.messageContent || msg 
              });
            }
          }
        } catch (e) {
          console.warn("Found JSON-like text but failed to parse:", e);
        }
      }

      conversationRef.current.push({ role: "assistant", content: uiDisplayContent });
      await speak(finalSpokenText);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setIsThinking(false);
      
      let errMsg = "Sir, ek technical issue aa gaya. Thoda wait karein aur retry karein.";
      
      if (err.message.includes("API key required")) {
        errMsg = "Sir, Gemini API Key missing hai. Please .env.local file check karein aur server restart karein.";
      } else if (err.message.includes("model not found")) {
        errMsg = "Sir, Gemini model specify karne mein problem ho rahi hai.";
      } else if (err.message) {
        errMsg = `Sir, ek error aaya hai: ${err.message}. Please check karein.`;
      }

      if (assistantMsgId) {
        updateLastAssistantMessage(assistantMsgId, errMsg, false);
      } else {
        addMessage({ role: "assistant", content: errMsg, intent });
      }
      fullResponse = errMsg;
      sounds.error();
    }

    pendingRef.current = false;
    setOrbState("idle");
    setStatusText("STANDBY");
  }, [groqApiKey, addMessage, updateLastAssistantMessage, speak]);

  // ─── Voice recognition ──────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Better for Hinglish
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let wakeDetected = false;
    let lastFinal = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // If Nova is currently speaking or just finished (echo duration), ignore EVERYTHING
      if (isSpeakingRef.current) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Double check lockout inside the chunk loop to catch late browser deliveries
        if (isSpeakingRef.current) continue;
        
        const t = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) final += t + " ";
        else interim += t;
      }

      const combined = (final + interim).toLowerCase();

      // Check for sleep command to end continuous session (Added "bye", "goodbye", "alvida")
      const sleepTriggers = ["go to sleep", "stop listening", "nova sleep", "bye", "goodbye", "alvida"];
      if (wakeDetected && sleepTriggers.some(t => combined.includes(t))) {
        wakeDetected = false;
        setWakeWordActive(false);
        setStatusText("STANDBY");
        lastFinal = final;
        return;
      }

      if (!wakeDetected && WAKE_WORDS.some(w => combined.includes(w))) {
        wakeDetected = true;
        setWakeWordActive(true);
        sounds.wakeWord();
        setStatusText("NOVA ARC ACTIVATED");
        lastFinal = final; // Ignore anything said before waking up
        return;
      }

      if (wakeDetected && final && final !== lastFinal) {
        // Extract only the newly finalized speech after the previous sentence
        let newText = final;
        if (final.startsWith(lastFinal)) {
          newText = final.substring(lastFinal.length).trim();
        }
        
        lastFinal = final;
        let command = newText;
        WAKE_WORDS.forEach(w => {
          command = command.replace(new RegExp(w, "gi"), "").trim();
        });
        command = command.replace(/^[,.\s]+/, "").trim();

        if (command.length > 2 && !pendingRef.current) {
          // Keep wakeDetected true for continuous conversation
          sendMessage(command);
        }
      }
    };

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error !== "no-speech" && ev.error !== "aborted") {
        console.warn("Speech recognition error:", ev.error);
      }
    };

    recognition.onend = () => {
      lastFinal = ""; // Clear tracker on restart to capture next input properly
      // Only auto-restart if she is NOT currently speaking. 
      // If she IS speaking, the browserSpeak function will handle the restart after its delay.
      if (isListeningRef.current && !isSpeakingRef.current) {
        // Auto-restart
        setTimeout(() => {
          try { recognition.start(); } catch { /* already restarting */ }
        }, 200);
      }
    };

    recognition.start();
  }, [sendMessage]);

  const toggleListening = useCallback(() => {
    if (!ambientStarted.current) {
      startAmbient();
      ambientStarted.current = true;
    }

    if (isListeningRef.current) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setWakeWordActive(false);
      setOrbState("idle");
      setStatusText("STANDBY");
    } else {
      setIsListening(true);
      setOrbState("listening");
      setStatusText("CONTINUOUS LISTENING");
      sounds.listeningStart();
      startRecognition();
    }
  }, [startRecognition]);

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const greeting = "Hello Sir! Main Nova Arc hoon, aap ki kya madad kar sakti hu. Bas 'Nova' bolo.";
    addMessage({ role: "assistant", content: greeting });
    
    // Attempt to voice out the greeting automatically. 
    // Note: Browser autoplay policies might require a click before audio plays.
    setTimeout(() => {
      speak(greeting);
    }, 500);
  }, [addMessage, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Computed orb state
  const computedOrbState: OrbState = isSpeaking
    ? "speaking"
    : isThinking
    ? "thinking"
    : isListening
    ? "listening"
    : orbState;

  return {
    messages,
    orbState: computedOrbState,
    isListening,
    isThinking,
    isSpeaking,
    statusText,
    wakeWordActive,
    sendMessage,
    toggleListening,
    clearHistory,
  };
}
