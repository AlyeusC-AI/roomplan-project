import { type NextRequest, NextResponse } from "next/server";
import { GooglePrediction } from "@/types/address";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY as string;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key", data: null });
  }

  const { searchParams } = new URL(
    req.url,
    `http://${req.headers?.get("host")}`
  );

  const input = searchParams.get("input");
  if (!input) {
    return NextResponse.json({ error: "Missing input parameter", data: null });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:us&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Transform Google's predictions format to match our frontend expectations
    const suggestions = data.predictions.map(
      (prediction: GooglePrediction) => ({
        name: prediction.structured_formatting.main_text,
        place_formatted: prediction.structured_formatting.secondary_text,
        place_id: prediction.place_id,
      })
    );

    return NextResponse.json({ data: suggestions, error: null });
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return NextResponse.json({ error: error, data: null });
  }
}
