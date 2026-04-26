"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: "chat" | "command" | "question" | "task";
  streaming?: boolean;
}

interface ChatPanelProps {
  messages: Message[];
  isThinking: boolean;
}

const intentBadges: Record<string, { label: string; color: string }> = {
  chat: { label: "💬 Chat", color: "rgba(0,200,255,0.2)" },
  command: { label: "⚡ Command", color: "rgba(255,150,0,0.2)" },
  question: { label: "❓ Query", color: "rgba(150,100,255,0.2)" },
  task: { label: "🔧 Task", color: "rgba(0,255,150,0.2)" },
};

export default function ChatPanel({ messages, isThinking }: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="chat-scroll chat-panel-container" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "4px",
            }}
          >
            {/* Role label */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                color: msg.role === "user" ? "rgba(0,212,255,0.6)" : "rgba(180,100,255,0.6)",
                textTransform: "uppercase",
              }}>
                {msg.role === "user" ? "SIR" : "NOVA ARC"}
              </span>
              {msg.intent && intentBadges[msg.intent] && (
                <span style={{
                  fontSize: "0.6rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: intentBadges[msg.intent].color,
                  border: `1px solid ${intentBadges[msg.intent].color}`,
                  color: "rgba(220,220,255,0.8)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                  {intentBadges[msg.intent].label}
                </span>
              )}
            </div>

            {/* Bubble */}
            <div
              className={msg.role === "user" ? "msg-user" : "msg-nova"}
              style={{
                padding: "10px 14px",
                maxWidth: "90%",
                fontSize: "0.9rem",
                lineHeight: 1.55,
                color: msg.role === "user" ? "rgba(220,240,255,0.95)" : "rgba(200,220,255,0.92)",
                position: "relative",
                wordBreak: "break-word",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 400,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div>{msg.content}</div>
              
              {msg.intent === "command" && msg.content.includes("llmCommand") === false && (
                <motion.button
                  whileHover={{ scale: 1.05, background: "rgba(0,212,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Re-trigger the open/search if needed, but usually just a visual confirmation
                    // Or if we have the command data in the msg object
                  }}
                  style={{
                    alignSelf: "flex-start",
                    marginTop: "4px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.3)",
                    color: "var(--nova-blue)",
                    fontSize: "0.65rem",
                    fontFamily: "'Orbitron', monospace",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                  TAP TO LAUNCH
                </motion.button>
              )}

              {msg.streaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ marginLeft: "2px", color: "rgba(0,212,255,0.8)" }}
                >
                  ▋
                </motion.span>
              )}
            </div>

            <span style={{
              fontSize: "0.58rem",
              color: "rgba(100,150,200,0.4)",
              fontFamily: "'Rajdhani', sans-serif",
            }}>
              {new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(msg.timestamp)}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Thinking indicator */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div style={{
              padding: "10px 16px",
              background: "rgba(0,10,25,0.6)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: "18px 18px 18px 4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.6rem",
                color: "rgba(0,212,255,0.5)",
                letterSpacing: "0.1em",
              }}>
                NOVA ARC
              </span>
              <div className="thinking-dots">
                <span /><span /><span />
              </div>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(150,180,220,0.6)",
                letterSpacing: "0.05em",
              }}>
                processing...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
