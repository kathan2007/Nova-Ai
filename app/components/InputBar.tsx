"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputBarProps {
  onSend: (text: string, file?: File) => void;
  onVoiceToggle: () => void;
  isListening: boolean;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function InputBar({ onSend, onVoiceToggle, isListening, isProcessing, disabled }: InputBarProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isListening && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [isListening, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || selectedFile) && !isProcessing && !disabled) {
      onSend(text.trim(), selectedFile || undefined);
      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ padding: "12px 16px 16px" }}
    >
      {/* File Preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0, 212, 255, 0.1)",
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <div style={{ color: "rgba(0, 212, 255, 0.8)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={removeFile}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 100, 100, 0.8)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* Attachment Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
        <motion.button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          whileTap={{ scale: 0.92 }}
          disabled={disabled || isProcessing}
          style={{
            width: "40px",
            height: "40px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(0, 212, 255, 0.2)",
            background: "rgba(0,10,25,0.4)",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          aria-label="Upload document"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </motion.button>

        {/* Mic Button */}
        <motion.button
          type="button"
          onClick={onVoiceToggle}
          className={`btn-mic ${isListening ? "active" : ""}`}
          whileTap={{ scale: 0.92 }}
          disabled={disabled}
          style={{
            width: "46px",
            height: "46px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid",
            borderColor: isListening ? "rgba(0,255,200,0.6)" : "rgba(0,212,255,0.3)",
            background: isListening
              ? "linear-gradient(135deg, rgba(0,255,200,0.2), rgba(0,212,255,0.2))"
              : "rgba(0,10,25,0.6)",
            borderRadius: "50%",
            cursor: "pointer",
            position: "relative",
          }}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          id="voice-toggle-btn"
        >
          {/* ... (existing SVG logic for mic) ... */}
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="rgba(0,255,200,0.9)" />
              </svg>
            </motion.div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="rgba(0,212,255,0.8)" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="rgba(0,212,255,0.8)" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 19v4M8 23h8" stroke="rgba(0,212,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "1px solid rgba(0,255,200,0.4)",
                }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Text Input */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            id="nova-text-input"
            className="glass-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... say 'Nova Arc' to activate" : "Type a message or press mic..."}
            disabled={isProcessing || disabled}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              fontSize: "0.9rem",
              fontWeight: 400,
              opacity: isProcessing ? 0.5 : 1,
            }}
            autoComplete="off"
          />
          {!isProcessing && (
            <motion.div
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "12px",
                border: "1px solid rgba(0,212,255,0.4)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          className="btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          disabled={(!text.trim() && !selectedFile) || isProcessing || disabled}
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: (!text.trim() && !selectedFile) || isProcessing ? 0.4 : 1,
            border: "1px solid rgba(0,212,255,0.4)",
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,47,255,0.15))",
            cursor: (text.trim() || selectedFile) && !isProcessing ? "pointer" : "not-allowed",
          }}
          id="send-btn"
          aria-label="Send message"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="rgba(0,212,255,0.8)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="rgba(0,212,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="rgba(0,212,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>
      </form>

      {/* Wake word hint */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          textAlign: "center",
          marginTop: "8px",
          fontFamily: "'Orbitron', monospace",
          fontSize: "0.55rem",
          letterSpacing: "0.15em",
          color: "rgba(0,212,255,0.4)",
        }}
      >
        SAY &quot;NOVA ARC&quot; TO ACTIVATE VOICE MODE • CONTINUOUS LISTENING ENABLED
      </motion.div>
    </motion.div>
  );
}
