"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ApiKeyModalProps {
  onSave: (groqKey: string, elevenKey: string) => void;
}

export default function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [groqKey, setGroqKey] = useState("");
  const [elevenKey, setElevenKey] = useState("");
  const [showGroq, setShowGroq] = useState(false);
  const [showEleven, setShowEleven] = useState(false);
  const [step, setStep] = useState<"keys" | "ready">("keys");

  const handleSave = () => {
    if (groqKey.trim()) {
      setStep("ready");
      setTimeout(() => onSave(groqKey.trim(), elevenKey.trim()), 1200);
    }
  };

  return (
    <div className="modal-overlay">
      <AnimatePresence mode="wait">
        {step === "keys" ? (
          <motion.div
            key="keys"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel"
            style={{
              width: "min(480px, 92vw)",
              borderRadius: "20px",
              padding: "36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* HUD corners */}
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-tr" />
            <div className="hud-corner hud-corner-bl" />
            <div className="hud-corner hud-corner-br" />

            {/* Top glow */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(0,212,255,0.6), transparent)",
            }} />

            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="nova-logo-text"
                style={{ fontSize: "2.2rem", marginBottom: "8px" }}
              >
                NOVA AI
              </motion.div>
              <div style={{
                fontFamily: "'Rajdhani', sans-serif",
                color: "rgba(150,180,220,0.6)",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
              }}>
                INITIALIZE SYSTEM • ENTER API CREDENTIALS
              </div>
            </div>

            {/* Groq Key */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "rgba(0,212,255,0.7)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                ◈ Groq API Key <span style={{ color: "rgba(255,100,100,0.7)" }}>*required</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="groq-api-key"
                  className="glass-input"
                  type={showGroq ? "text" : "password"}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 14px",
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button
                  onClick={() => setShowGroq(!showGroq)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(0,212,255,0.5)",
                    fontSize: "0.75rem",
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  {showGroq ? "HIDE" : "SHOW"}
                </button>
              </div>
              <p style={{
                marginTop: "6px",
                fontSize: "0.7rem",
                color: "rgba(100,150,200,0.5)",
                fontFamily: "'Rajdhani', sans-serif",
              }}>
                Get free key at console.groq.com
              </p>
            </div>

            {/* ElevenLabs Key */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{
                display: "block",
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                color: "rgba(123,47,255,0.8)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                ◈ ElevenLabs API Key <span style={{ color: "rgba(150,150,150,0.5)" }}>optional (voice)</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="eleven-api-key"
                  className="glass-input"
                  type={showEleven ? "text" : "password"}
                  value={elevenKey}
                  onChange={(e) => setElevenKey(e.target.value)}
                  placeholder="Leave blank to use browser TTS"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 14px",
                    borderRadius: "10px",
                    fontSize: "0.88rem",
                    borderColor: "rgba(123,47,255,0.25)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                />
                <button
                  onClick={() => setShowEleven(!showEleven)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(123,47,255,0.5)",
                    fontSize: "0.75rem",
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  {showEleven ? "HIDE" : "SHOW"}
                </button>
              </div>
              <p style={{
                marginTop: "6px",
                fontSize: "0.7rem",
                color: "rgba(100,150,200,0.5)",
                fontFamily: "'Rajdhani', sans-serif",
              }}>
                Bella voice (eleven_multilingual_v2) • elevenlabs.io
              </p>
            </div>

            {/* Boot Button */}
            <motion.button
              onClick={handleSave}
              disabled={!groqKey.trim()}
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              id="boot-nova-btn"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                fontSize: "1rem",
                letterSpacing: "0.2em",
                opacity: groqKey.trim() ? 1 : 0.4,
                cursor: groqKey.trim() ? "pointer" : "not-allowed",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.08), transparent)",
                }}
              />
              ⚡ BOOT NOVA AI
            </motion.button>

            <p style={{
              marginTop: "14px",
              textAlign: "center",
              fontSize: "0.68rem",
              color: "rgba(100,150,200,0.4)",
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.05em",
            }}>
              Keys are stored locally in session only • Never sent to third parties
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: 2 }}
              className="nova-logo-text"
              style={{ fontSize: "3rem" }}
            >
              NOVA AI
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.8rem",
                color: "rgba(0,212,255,0.7)",
                letterSpacing: "0.2em",
                marginTop: "16px",
              }}
            >
              SYSTEM ONLINE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
