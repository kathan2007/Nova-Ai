"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import NovaOrb from "./components/NovaOrb";
import ChatPanel from "./components/ChatPanel";
import InputBar from "./components/InputBar";
import HudStatus from "./components/HudStatus";
import { useNova } from "./lib/useNova";

// Dynamically import heavy background (no SSR)
const StarfieldBackground = dynamic(() => import("./components/StarfieldBackground"), { ssr: false });

interface NovaAppProps {
}

function NovaApp({}: NovaAppProps) {
  const {
    wakeWordActive,
    sendMessage,
    toggleListening,
    clearHistory,
    statusText,
    isListening,
    messages,
    orbState,
    isThinking,
  } = useNova();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 5,
      }}
    >
      {/* Scanline effect */}
      <div className="scanline" />

      {/* HUD overlay */}
      <HudStatus
        statusText={statusText}
        isListening={isListening}
        wakeWordActive={wakeWordActive}
        messageCount={messages.length}
      />

      {/* Main layout */}
      <div className="main-container" style={{
        width: "100%",
        maxWidth: "800px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}>
        {/* Orb section */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "20px",
          paddingBottom: "32px",
          gap: "8px",
          flexShrink: 0,
        }}>
          {/* Top decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              width: "200px",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(0,212,255,0.4), transparent)",
              marginBottom: "16px",
            }}
          />

          <NovaOrb state={orbState} onClick={toggleListening} />

          {/* Orb title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: "48px",
              textAlign: "center",
            }}
          >
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.35em",
              background: "linear-gradient(135deg, #00d4ff, #7b2fff, #00fff7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 8px rgba(0,212,255,0.4))",
            }}>
              NOVA ARC
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(150,180,220,0.45)",
              letterSpacing: "0.25em",
              marginTop: "3px",
            }}>
              INTELLIGENT ASSISTANT SYSTEM
            </div>
          </motion.div>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              width: "200px",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(0,212,255,0.3), transparent)",
              marginTop: "12px",
            }}
          />
        </div>

        {/* Chat glass panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel"
          style={{
            flex: 1,
            borderRadius: "20px 20px 0 0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            minHeight: 0,
          }}
        >
          {/* HUD corners on chat panel */}
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />

          {/* Panel top glow */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "40%",
            height: "1px",
            background: "linear-gradient(to right, transparent, rgba(0,212,255,0.5), transparent)",
          }} />

          {/* Chat panel header */}
          <div style={{
            padding: "14px 20px 10px",
            borderBottom: "1px solid rgba(0,212,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}>
            <div className="status-dot" style={{
              background: isListening ? "#00ff9d" : "rgba(0,212,255,0.8)",
              boxShadow: `0 0 6px ${isListening ? "#00ff9d" : "rgba(0,212,255,0.5)"}`,
            }} />
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.15em",
              color: "rgba(0,212,255,0.5)",
            }}>
              CONVERSATION · SESSION ACTIVE
            </span>
            <div style={{ flex: 1 }} />
            
            {/* Clear History Button */}
            <motion.button
              whileHover={{ color: "rgba(255,0,80,0.9)", scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
              title="Clear all messages"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.5rem",
                letterSpacing: "0.1em",
                color: "inherit",
              }}>
                ERASE MEMORY
              </span>
            </motion.button>

            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(100,150,200,0.4)",
              marginLeft: "10px",
            }}>
              {messages.length} messages
            </span>
          </div>

          {/* Messages */}
          <ChatPanel messages={messages} isThinking={isThinking} />

          {/* Input bar */}
          <InputBar
            onSend={sendMessage}
            onVoiceToggle={toggleListening}
            isListening={isListening}
            isProcessing={isThinking}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [booted, setBooted] = useState(false);

  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#060f1e", position: "relative" }}>
      {/* 3D Starfield */}
      <StarfieldBackground />

      <AnimatePresence mode="wait">
        {!booted ? (
          <motion.div
            key="boot-screen"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              background: "rgba(6, 15, 30, 0.7)",
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "1.5rem",
                color: "var(--nova-blue)",
                letterSpacing: "0.3em",
                marginBottom: "30px",
                textShadow: "0 0 20px rgba(0, 212, 255, 0.8)",
              }}
            >
              NOVA ARC
            </motion.div>
            
            <button
              onClick={() => setBooted(true)}
              className="btn-primary"
              style={{
                padding: "16px 40px",
                fontSize: "1.2rem",
                borderRadius: "30px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                boxShadow: "0 0 30px rgba(0, 212, 255, 0.2)",
              }}
            >
              NOVA ARC
            </button>
          </motion.div>
        ) : (
          <NovaApp key="app" />
        )}
      </AnimatePresence>
    </main>
  );
}
