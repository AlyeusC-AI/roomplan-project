import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    
    return NextResponse.json(authenticationParameters, { status: 200 });
  } catch (error) {
    console.error("Error generating ImageKit authentication parameters:", error);
    return NextResponse.json(
      { 
        status: "failed",
        message: "Failed to generate authentication parameters" 
      }, 
      { status: 500 }
    );
  }
}
