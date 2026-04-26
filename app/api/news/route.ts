import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "technology";

  try {
    const apiKey = "pub_16df54fc09d740a1884efa4ac4e818e2";
    
    // Using NewsData.io since your key starts with 'pub_'
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en`
    );

    if (!response.ok) {
      throw new Error("News API error");
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const articles = data.results.slice(0, 3).map((article: any) => ({
        title: article.title,
        source: article.source_id || "Internet",
      }));
      return NextResponse.json({ articles });
    } else {
      return NextResponse.json({ articles: [{ title: `No major news found for ${query} at the moment.`, source: "System" }] });
    }
  } catch (error) {
    return NextResponse.json({ articles: [{ title: "Unable to fetch live news at this time.", source: "Error" }] });
  }
}
