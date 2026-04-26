import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const { target } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    // A map to securely resolve targets to URLs for the OS
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
      googlemaps: "https://maps.google.com",
      news: "https://news.google.com",
      weather: "https://weather.com",
      whatsapp: "https://web.whatsapp.com",
      facebook: "https://facebook.com",
      amazon: "https://amazon.com",
      flipkart: "https://flipkart.com",
    };

    const key = target.toLowerCase().replace(/\s+/g, "").replace(/\.com$/, "");
    let url = siteMap[key] || target;

    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    // On Windows, the "start" command opens a URL in the default browser natively
    return new Promise<NextResponse>((resolve) => {
      exec(`start "" "${url}"`, (error) => {
        if (error) {
          console.error("OS Failed to open:", error);
          resolve(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, url }));
        }
      });
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
