"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HudStatusProps {
  statusText: string;
  isListening: boolean;
  wakeWordActive: boolean;
  messageCount: number;
}

export default function HudStatus({ statusText, isListening, wakeWordActive, messageCount }: HudStatusProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusColor = isListening
    ? "#00ff9d"
    : wakeWordActive
    ? "#ffcc00"
    : "rgba(0,212,255,0.8)";

  return (
    <>
      {/* ── Top-Left: Logo + Status ── */}
      <div style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        userSelect: "none",
      }}>
        {/* Logo */}
        <div className="nova-logo-text" style={{ fontSize: "1.3rem", letterSpacing: "0.3em" }}>
          NOVA ARC
        </div>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "0.5rem",
          color: "rgba(0,212,255,0.35)",
          letterSpacing: "0.2em",
        }}>
          INTELLIGENT ASSISTANT · v3.7
        </div>

        {/* Status row */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: isListening ? 1 : 2, repeat: Infinity }}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
              flexShrink: 0,
            }}
          />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.12em",
            color: "rgba(0,212,255,0.55)",
          }}>
            {statusText}
          </span>
        </div>

        {/* Wake word badge */}
        {wakeWordActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(255,204,0,0.12)",
              border: "1px solid rgba(255,204,0,0.35)",
              borderRadius: "20px",
              padding: "3px 10px",
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.55rem",
              color: "rgba(255,220,60,0.9)",
              letterSpacing: "0.1em",
              marginTop: "2px",
            }}
          >
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>◈</motion.span>
            NOVA ARC ACTIVATED
          </motion.div>
        )}

        {/* Live listening waveform */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: "2px", alignItems: "center", marginTop: "4px" }}
          >
            {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6].map((base, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${base * 6}px`, `${base * 18}px`, `${base * 6}px`] }}
                transition={{ duration: 0.4 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                style={{
                  width: "2px",
                  borderRadius: "1px",
                  background: "linear-gradient(to top, rgba(0,212,255,0.5), rgba(0,255,180,0.3))",
                }}
              />
            ))}
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.5rem",
              color: "rgba(0,255,180,0.5)",
              marginLeft: "4px",
              letterSpacing: "0.15em",
            }}>LIVE</span>
          </motion.div>
        )}
      </div>

      {/* ── Top-Right: Clock + System Stats ── */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "5px",
        userSelect: "none",
      }}>
        {/* Clock */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.85rem",
            color: "rgba(0,212,255,0.65)",
            letterSpacing: "0.08em",
          }}
        >
          {time}
        </motion.div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "0.7rem",
          color: "rgba(0,212,255,0.3)",
          letterSpacing: "0.1em",
        }}>
          {date}
        </div>

        {/* System bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
          {[
            { label: "CPU", color: "rgba(0,212,255,0.6)" },
            { label: "MEM", color: "rgba(123,47,255,0.6)" },
            { label: "NET", color: "rgba(0,255,180,0.5)" },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "0.48rem",
                color: "rgba(0,212,255,0.3)",
                letterSpacing: "0.12em",
                width: "26px",
                textAlign: "right",
              }}>{label}</span>
              <div style={{
                width: "48px",
                height: "3px",
                background: "rgba(0,10,25,0.8)",
                borderRadius: "2px",
                overflow: "hidden",
              }}>
                <motion.div
                  animate={{ width: ["25%", "70%", "45%", "80%", "35%"] }}
                  transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ height: "100%", background: color, borderRadius: "2px" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Context count */}
        <div style={{
          marginTop: "4px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.48rem",
            color: "rgba(0,212,255,0.25)",
            letterSpacing: "0.1em",
          }}>CONTEXT</span>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(0,212,255,0.4)",
          }}>{messageCount} msgs</span>
        </div>
      </div>

      {/* ── Bottom decorative strip ── */}
      <div style={{
        position: "fixed",
        bottom: "10px",
        left: "20px",
        right: "20px",
        zIndex: 5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "24px", height: "1px", background: "linear-gradient(to right, transparent, rgba(0,212,255,0.15))" }} />
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.45rem",
            color: "rgba(0,212,255,0.18)",
            letterSpacing: "0.2em",
          }}>NOVA ARC · INTELLIGENT ASSISTANT SYSTEM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "0.45rem",
            color: "rgba(0,212,255,0.18)",
            letterSpacing: "0.12em",
          }}>POWERED BY GROQ · ELEVENLABS · WEB SPEECH API</span>
          <div style={{ width: "24px", height: "1px", background: "linear-gradient(to left, transparent, rgba(0,212,255,0.15))" }} />
        </div>
      </div>
    </>
  );
}
