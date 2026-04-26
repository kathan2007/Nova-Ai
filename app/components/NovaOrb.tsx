"use client";

import { motion } from "framer-motion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface NovaOrbProps {
  state: OrbState;
  onClick?: () => void;
}

const stateColors = {
  idle: { primary: "rgba(0,212,255,0.4)", secondary: "rgba(123,47,255,0.5)", glow: "rgba(0,212,255,0.3)" },
  listening: { primary: "rgba(0,255,200,0.5)", secondary: "rgba(0,212,255,0.6)", glow: "rgba(0,255,200,0.5)" },
  thinking: { primary: "rgba(123,47,255,0.5)", secondary: "rgba(200,100,255,0.4)", glow: "rgba(123,47,255,0.4)" },
  speaking: { primary: "rgba(255,100,200,0.4)", secondary: "rgba(123,47,255,0.6)", glow: "rgba(255,100,200,0.4)" },
};

const stateLabels = {
  idle: "STANDBY",
  listening: "LISTENING",
  thinking: "PROCESSING",
  speaking: "RESPONDING",
};

export default function NovaOrb({ state, onClick }: NovaOrbProps) {
  const colors = stateColors[state];
  const isListening = state === "listening";
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";

  // Orb scale animation based on state
  const orbScale =
    isListening ? [1, 1.07, 1] :
    isThinking ? [1, 0.96, 1] :
    isSpeaking ? [1, 1.06, 0.97, 1.04, 1] :
    [1, 1.02, 1];

  const orbDuration = isListening ? 1 : isThinking ? 2 : isSpeaking ? 0.6 : 4;

  return (
    <div className={`nova-orb-container orb-${state}`} onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Energy waves for speaking state */}
      {isSpeaking && (
        <>
          <div className="energy-wave" style={{ position: "absolute" }} />
          <div className="energy-wave" style={{ position: "absolute" }} />
          <div className="energy-wave" style={{ position: "absolute" }} />
        </>
      )}

      {/* Outer rings */}
      <div className="nova-orb-ring nova-orb-ring-3" />
      <div className="nova-orb-ring nova-orb-ring-2" />
      <div className="nova-orb-ring nova-orb-ring-1" />

      {/* Main orb */}
      <motion.div
        className="nova-orb"
        animate={{ scale: orbScale, y: state === "idle" ? [0, -8, 0] : 0 }}
        transition={{
          duration: orbDuration,
          repeat: Infinity,
          ease: state === "idle" ? "easeInOut" : "linear",
          repeatType: "loop",
        }}
      >
        <motion.div
          className="nova-orb-core"
          animate={{
            boxShadow: [
              `inset 0 0 30px ${colors.primary}, inset 0 0 60px ${colors.secondary}, 0 0 30px ${colors.glow}, 0 0 60px ${colors.secondary}, 0 0 100px ${colors.primary}`,
              `inset 0 0 50px ${colors.primary}, inset 0 0 90px ${colors.secondary}, 0 0 50px ${colors.glow}, 0 0 90px ${colors.secondary}, 0 0 140px ${colors.primary}`,
              `inset 0 0 30px ${colors.primary}, inset 0 0 60px ${colors.secondary}, 0 0 30px ${colors.glow}, 0 0 60px ${colors.secondary}, 0 0 100px ${colors.primary}`,
            ],
          }}
          transition={{
            duration: orbDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: `radial-gradient(circle at 35% 35%,
              rgba(255, 255, 255, 0.18) 0%,
              ${colors.primary} 20%,
              ${colors.secondary} 50%,
              rgba(0, 12, 40, 0.95) 80%
            )`,
          }}
        >
          {/* Inner shimmer */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, transparent, rgba(0,212,255,0.15), transparent, rgba(123,47,255,0.15), transparent)",
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Thinking particle ring */}
          {isThinking && (
            <motion.div
              style={{
                position: "absolute",
                inset: "10%",
                borderRadius: "50%",
                border: "1px dashed rgba(123,47,255,0.5)",
              }}
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Nova logo / icon in center */}
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontWeight: 900,
                fontSize: "28px",
                letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #00d4ff, #ffffff, #7b2fff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 8px rgba(0,212,255,0.8))",
              }}
            >
              N
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Status label */}
      <motion.div
        style={{
          position: "absolute",
          bottom: -28,
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="status-bar" style={{ color: "rgba(0,212,255,0.7)", fontSize: "0.6rem" }}>
          ◈ {stateLabels[state]}
        </span>
      </motion.div>

      {/* Waveform below orb when speaking */}
      {isSpeaking && (
        <motion.div
          className="waveform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: "absolute", bottom: -50 }}
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="waveform-bar" style={{ height: `${Math.random() * 16 + 4}px` }} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
