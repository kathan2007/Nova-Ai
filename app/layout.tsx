import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Arc — Futuristic AI Assistant",
  description: "Nova Arc is a Jarvis-style futuristic AI assistant with real-time voice interaction, cyberpunk interface, and advanced multi-tool intelligence.",
  keywords: ["AI assistant", "voice AI", "Nova Arc", "Jarvis", "cyberpunk AI"],
  openGraph: {
    title: "Nova Arc — Your Futuristic AI Assistant",
    description: "Real-time voice interaction, cyberpunk UI, and intelligent multi-tool AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B1F3A" />
      </head>
      <body>{children}</body>
    </html>
  );
}
