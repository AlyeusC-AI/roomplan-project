import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUri } = await req.json();
    const response = await fetch(
      "https://vision.googleapis.com/v1/images:annotate?alt=json&key=" +
        process.env.GOOGLE_VISION_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                source: {
                  imageUri,
                },
              },
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      }
    );
    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
