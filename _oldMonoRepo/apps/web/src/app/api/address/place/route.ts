import { type NextRequest, NextResponse } from "next/server";
import { AddressType, GooglePlaceDetails } from "@/types/address";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key", data: null });
  }

  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({
      error: "Missing placeId parameter",
      data: null,
    });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as GooglePlaceDetails;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!data.result) {
      throw new Error("Place details not found");
    }

    // Extract address components
    const addressComponents = data.result.address_components;
    let streetNumber = "",
      route = "",
      city = "",
      region = "",
      postalCode = "",
      country = "";

    addressComponents.forEach((component) => {
      const types = component.types;
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        route = component.long_name;
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        region = component.long_name;
      } else if (types.includes("postal_code")) {
        postalCode = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      }
    });

    const address =
      streetNumber && route
        ? `${streetNumber} ${route}`
        : data.result.formatted_address.split(",")[0];

    const formattedData: AddressType = {
      address,
      formattedAddress: data.result.formatted_address,
      city,
      region,
      postalCode,
      country,
      lat: data.result.geometry.location.lat,
      lng: data.result.geometry.location.lng,
    };

    return NextResponse.json({
      data: formattedData,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching place details:", err);
    return NextResponse.json({ error: err, data: null });
  }
}
