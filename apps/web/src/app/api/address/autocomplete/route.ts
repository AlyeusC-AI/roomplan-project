import { uniqueId } from "lodash";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY as string;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key", data: null });
  }

  const { searchParams } = new URL(
    req.url,
    `http://${req.headers?.get("host")}`
  );
  // Check if your hosting provider gives you the country code
  const input = searchParams.get("input");
  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${input}&language=en&limit=10&session_token=${uniqueId()}&country=US&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.json();

    console.log("data", data);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return NextResponse.json({ data: data.suggestions, error: null });
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return NextResponse.json({ error: error, data: null });
  }
}
