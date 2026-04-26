import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "Ahmedabad";

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      // Fallback mock data
      return NextResponse.json({
        city,
        temp_c: 32,
        condition: "Sunny",
        humidity: 45,
        wind_kph: 12,
        feels_like_c: 34,
        icon: "☀️",
      });
    }

    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`
    );

    if (!response.ok) throw new Error("Weather API error");

    const data = await response.json();
    return NextResponse.json({
      city: data.location.name,
      temp_c: data.current.temp_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      wind_kph: data.current.wind_kph,
      feels_like_c: data.current.feelslike_c,
      icon: data.current.condition.icon,
    });
  } catch {
    return NextResponse.json({
      city,
      temp_c: 32,
      condition: "Sunny",
      humidity: 45,
      wind_kph: 12,
      feels_like_c: 34,
      icon: "☀️",
    });
  }
}
