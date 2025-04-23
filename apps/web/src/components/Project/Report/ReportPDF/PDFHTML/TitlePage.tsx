import { format } from "date-fns";
import { orgStore } from "@atoms/organization";
import { projectStore } from "@atoms/project";
import React from "react";
import "./TitlePage.css";
import PDFSafeImage from "./PDFSaveImage";

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="pdf info-row">
    <span className="pdf label">{label}</span>
    <span className="pdf value">{value || "N/A"}</span>
  </div>
);

const TitlePage = () => {
  const projectInfo = projectStore((state) => state.project);
  const orgInfo = orgStore((state) => state.organization);
  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-pictures/${orgInfo?.publicId ?? ""}/${orgInfo?.logoId ?? ""}.png`

  return (
    <div className="pdf first-page">
       <div className="pdf " style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
       <div className="pdf logo-section  header-left">
              <PDFSafeImage
                style={{ width: "50px", height: "50px" }}
                url={logoUrl}
                alt="Organization Logo"
                className="pdf org-logo"
              />
                {/* <span className="pdf org-name">{orgInfo?.name}</span> */}
              
           
            </div>
            <div className="pdf  header-right">
              <InfoRow 
                label="Date Reported" 
                value={format(new Date(), "MM/dd/yyyy")} 

              />
              </div>
              </div>
      <div className="pdf report-container">
       <div className="pdf header-section-border">

   
        {/* Top Section with diagonal line */}
        <div className="pdf header-section">
          {/* Left side with logo and company name */}
          <div className="pdf header-left">
           

            {/* Report Title */}
            <div className="pdf report-title-section">
              <h1 className="pdf">{orgInfo?.name}</h1>
              
              {/* <h2 className="pdf report-number">{projectInfo?.publicId || "N/A"}</h2> */}
            </div>
              <InfoRow label="Address" value={projectInfo?.location} />

            {/* Key Information */}
            <div className="pdf key-info">
              <InfoRow label="Type of Loss" value={projectInfo?.damageType || "N/A"} />
              <InfoRow 
                label="Category" 
                value={ `${projectInfo?.catCode}` || "N/A"} 
              />
              <InfoRow 
                label="Date of Loss" 
                value={projectInfo?.dateOfLoss ? format(new Date(projectInfo.dateOfLoss), "MM/dd/yyyy") : "N/A"} 
              />
              <InfoRow label="Insurance Company" value={projectInfo?.insuranceCompanyName} />
            
            </div>
          </div>

          {/* Right side with property image */}
          {projectInfo?.mainImage && (
            <div className="pdf property-image">
              <PDFSafeImage
                url={projectInfo.mainImage}
                alt="Property"
                className="pdf"
              />
            </div>
          )}
        </div>
        </div>

        {/* Three Columns Section */}
        <div className="pdf columns-section">
          {/* Column 1 - Project Details */}
          <div className="pdf info-column">
            <h3 className="pdf column-title">Project Details</h3>
            <InfoRow label="Project Manager" value={projectInfo?.managerName} />
            <InfoRow label="Project Status" value={projectInfo?.status || "N/A"} />
            <InfoRow label="Assignment #" value={projectInfo?.assignmentNumber} />
          </div>

          {/* Column 2 - Insurance Details */}
          <div className="pdf info-column">
            <h3 className="pdf column-title">Insurance Details</h3>
            <InfoRow label="Policy Number" value={projectInfo?.policyNumber || "N/A"} />
            <InfoRow label="Claim #" value={projectInfo?.insuranceClaimId} />
            <InfoRow label="Adjuster" value={projectInfo?.adjusterName} />
          </div>

          {/* Column 3 - Customer Information */}
          <div className="pdf info-column">
            <h3 className="pdf column-title">Customer Information</h3>
            <InfoRow label="Client Phone" value={projectInfo?.clientPhoneNumber} />
            <InfoRow label="Client Email" value={projectInfo?.clientEmail} />
            <InfoRow label="Adjuster Email" value={projectInfo?.adjusterEmail} />
          </div>
        </div>

        {/* Damage Description */}
        <div className="pdf damage-section">
          <h3 className="pdf section-title">Loss Summary</h3>
          <p className="pdf description-text">{projectInfo?.claimSummary || "N/A"}</p>
        </div>
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
