import { format } from "date-fns";
import { orgStore } from "@atoms/organization";
import { projectStore } from "@atoms/project";
import React from "react";

const SummaryDetail = ({ title, value }: { title: string; value: string }) => (
  <td style={{ textAlign: "left", width: "50%" }}>
    <h3>{title}</h3>
    <p>{value}</p>
  </td>
);

const SummarySection = ({ children }: { children: React.ReactNode }) => (
  <table className='title-page-summary-section'>
    <tbody>
      <tr>{children}</tr>
    </tbody>
  </table>
);

const TitlePage = () => {
  const projectInfo = projectStore((state) => state.project);
  const orgInfo = orgStore((state) => state.organization);
  const [address, setAddress] = React.useState<GeocodingResponse | null>(null);

  React.useEffect(() => {
    console.log("FETCHING ADDRESS");
    if (projectInfo?.lat && projectInfo.lng) {
      getAddressFromCoordinates(
        Number(projectInfo?.lat),
        Number(projectInfo.lng)
      )
        .then((address) => {
          setAddress(address);
          console.log(address);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <div className='pdf first-page'>
      <div>
        <table className='pdf invoice-info-container'>
          <tbody>
            <tr>
              <td rowSpan={2} className='pdf client-name'>
                {orgInfo?.name}
              </td>
              <td></td>
            </tr>
            <tr>
              <td>{projectInfo?.location}</td>
            </tr>
            <tr>
              <td>
                Report Date:{" "}
                <strong>{format(Date.now(), "LLLL	d, yyyy")}</strong>
              </td>
              {/* <td>{`${parsedAddress.city || ""} ${parsedAddress.state || ""}${
                parsedAddress.zip ? `, ${parsedAddress.zip}` : ""
              }`}</td> */}
            </tr>
            <tr>
              <td></td>
              <td>{projectInfo?.adjusterEmail}</td>
            </tr>
          </tbody>
        </table>

        <SummarySection>
          <SummaryDetail
            title='Client Name'
            value={projectInfo?.clientName ?? ""}
          />
          <SummaryDetail title='Address' value={projectInfo?.location ?? ""} />
        </SummarySection>
        <SummarySection>
          <SummaryDetail
            title='Type of Loss'
            value={projectInfo?.lossType ?? ""}
          />
          {projectInfo?.lossType === "Water" && (
            <SummaryDetail
              title='Category of Loss'
              value={`${projectInfo?.catCode || ""}`}
            />
          )}
        </SummarySection>
        <SummarySection>
          <SummaryDetail
            title='Insurance Carrier'
            value={projectInfo?.insuranceCompanyName ?? ""}
          />
          <SummaryDetail
            title='Claim ID'
            value={projectInfo?.insuranceClaimId ?? ""}
          />
        </SummarySection>
        <SummarySection>
          <SummaryDetail
            title='Adjuster Name'
            value={projectInfo?.adjusterName ?? ""}
          />
          <SummaryDetail
            title='Adjuster Email'
            value={projectInfo?.adjusterEmail ?? ""}
          />
        </SummarySection>
      </div>
    </div>
  );
};

export default TitlePage;

/**
 * Fetches the address for the given latitude and longitude using the Mapbox Geocoding API.
 * @param lat - The latitude of the location.
 * @param lng - The longitude of the location.
 * @returns A promise that resolves to the address string or null if not found.
 */
async function getAddressFromCoordinates(
  lat: number,
  lng: number
): Promise<GeocodingResponse | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY; // Replace with your Mapbox access token
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}`;

  try {
    console.log("Before fetch");
    const response = await fetch(url);
    console.log("After fetch");

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data: GeocodingResponse = await response.json();

    console.log(data);

    if (data.features && data.features.length > 0) {
      return data;
    } else {
      console.log("No address found for these coordinates.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
}

interface Geometry {
  coordinates: number[];
  type: string;
}

interface Context {
  id: string;
  text: string;
}

interface Feature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Record<string, unknown>;
  text: string;
  place_name: string;
  bbox: number[];
  center: number[];
  geometry: Geometry;
  context: Context[];
}

interface GeocodingResponse {
  type: string;
  query: number[];
  features: Feature[];
  attribution: string;
}
