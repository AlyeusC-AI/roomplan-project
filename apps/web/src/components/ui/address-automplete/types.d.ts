declare interface RetrieveResponse {
  type: string; // e.g., "FeatureCollection"
  features: Feature[];
}

interface Feature {
  type: string; // e.g., "Feature"
  geometry: Geometry;
  properties: Properties;
}

interface Geometry {
  type: string; // e.g., "Point"
  coordinates: [number, number]; // [longitude, latitude]
}

interface Properties {
  name: string;
  address?: string;
  full_address?: string;
  place_formatted: string;
  context: Context;
  language: string;
  maki?: string;
  poi_category?: string[];
  brand?: string[];
  external_ids?: Record<string, string>;
  metadata?: Record<string, unknown>;
  distance?: number;
  eta?: number;
}

interface Context {
  country?: ContextDetail;
  region?: ContextDetail;
  postcode?: ContextDetail;
  district?: ContextDetail;
  place?: ContextDetail;
  locality?: ContextDetail;
  neighborhood?: ContextDetail;
  address?: ContextDetail;
  street?: ContextDetail;
}

interface ContextDetail {
  id: string;
  name: string;
  country_code?: string;
  region_code?: string;
  region_code_full?: string;
}

interface AddressType {
  address: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface Suggestion {
  name: string;
  mapbox_id: string;
  feature_type: string;
  place_formatted: string;
}
