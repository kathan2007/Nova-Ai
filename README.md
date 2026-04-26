# 🌌 Nova AI — Futuristic Jarvis-Style AI Assistant

> A cyberpunk AI assistant with real-time voice interaction, ElevenLabs Bella voice, Groq LLM, and an immersive 3D holographic UI.

---

## ✨ Features

- **🎙️ Jarvis-Style Voice** — Continuous listening with **"Nova" wake word** activation
- **🔊 ElevenLabs TTS** — Bella voice (eleven_multilingual_v2) with premium streaming
- **🧠 Groq AI** — Ultra-fast LLaMA 3.3 70B responses with full session memory
- **🌐 Hinglish Mode** — Always addresses you as **"Sir"** in English + Hindi blend
- **🎨 Cyberpunk UI** — 3D starfield, AI orb with 4 states, glassmorphism chat panel
- **⚡ Intent Detection** — Chat / Command / Question / Task routing
- **🔧 Multi-Tool** — Open sites, search web, weather, calculator

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Get your API keys
| Key | Required | Source |
|-----|----------|--------|
| **Groq API** | ✅ Required | [console.groq.com](https://console.groq.com) (Free) |
| **ElevenLabs** | Optional | [elevenlabs.io](https://elevenlabs.io) (Bella voice) |

No `.env` needed — keys are entered securely in the app UI on first load.

### 3. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

| Trigger | Example |
|---------|---------|
| **Wake word** | *"Nova, what's the weather?"* |
| **Open apps** | *"Open YouTube"* / *"Open GitHub"* |
| **Web search** | *"Search latest AI news"* |
| **Weather** | *"Weather in Mumbai"* |
| **Calculate** | *"Calculate 128 * 47"* |
| **AI tasks** | *"Write a LinkedIn post about AI"* |
| **Hinglish chat** | *"Nova, aaj kya karna chahiye?"* |

---

## 🎨 UI States

| Orb State | Trigger |
|-----------|---------|
| 🌀 **Idle** — Slow floating glow | Standby mode |
| 💙 **Listening** — Expanded blue | Mic active |
| 💜 **Thinking** — Slow pulse | Processing request |
| 🌊 **Speaking** — Energy waves | Nova responding |

---

## 🛠️ Stack

- **Frontend**: Next.js 16, React 19, Framer Motion
- **Styling**: Tailwind CSS v4, custom cyberpunk CSS
- **AI**: Groq (LLaMA 3.3 70B, streaming)
- **Voice In**: Web Speech API (SpeechRecognition)
- **Voice Out**: ElevenLabs API (Bella voice) + browser TTS fallback
- **Background**: Canvas 2D starfield with parallax mouse effect
- **Sound**: Web Audio API (ambient hum + interaction sounds)
