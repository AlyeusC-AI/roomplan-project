import { uniqueId } from "lodash";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const apiKey = process.env.GOOGLE_MAPS_API_KEY as string;

	if (!apiKey) {
		return NextResponse.json({ error: "Missing API Key", data: null });
	}

	const placeId = req.nextUrl.searchParams.get("placeId")
	const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${placeId}?session_token=${uniqueId()}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`;

	try {
		const response = await fetch(url);


		const data: RetrieveResponse = await response.json();

		console.log("data", data);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const address1 = data.features[0].properties.address ?? "";
		const address2 = "";
		const city = data.features[0].properties.context.place?.name ?? "";
		const region = data.features[0].properties.context.region?.name ?? "";
		const postalCode = data.features[0].properties.context.postcode?.name ?? "";
		const country = data.features[0].properties.context.country?.name ?? "";
		const lat = data.features[0].geometry.coordinates[1];
		const lng = data.features[0].geometry.coordinates[0];

		const formattedAddress = data.features[0].properties.place_formatted;

		const formattedData: AddressType = {
			address1,
			address2,
			formattedAddress,
			city,
			region,
			postalCode,
			country,
			lat,
			lng,
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