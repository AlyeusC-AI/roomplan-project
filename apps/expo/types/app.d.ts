declare type ProjectStatus =
  | "active"
  | "mitigation"
  | "inspection"
  | "review"
  | "completed"
  | "inactive"
  | "incomplete";

declare interface ProjectType {
  publicId: string;
  createdAt: Date;
  name: string;
  clientName?: string;
  location: string;
  status: ProjectStatus | null;
  lat?: string;
  lng?: string;
  currentStatus?: {
    label: string;
    description?: string;
    color?: string;
    publicId: string;
  };
  projectAssignees: {
    userId: string;
    user: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  }[];
  images: { key: string }[];
  _count: { images: number };
}


declare interface RoomData {
  name: string;
  publicId: string;
  inferences: InferenceMetaData[];
  detections: InferenceItemDetection[];
  notes: {
    createdAt: Date;
    date: Date;
    publicId: string;
    updatedAt: Date;
    projectId: number;
    body: string;
    notesAuditTrail: {
      createdAt: Date;
      userName: string | null;
    }[];
  }[];
}

declare interface InferenceMetaData {
  imageKey: string;
  publicId: string;
}

declare interface InferenceItemDetection {
  publicId: string;
  imageKey?: string | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  confidence?: number | null;
  code: string;
  item: string;
  quality: string;
  category: string;
  dimension: number;
  unit: string;
}

declare interface ProjectInfo {
  name: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  location: string;
  managerName: string;
  companyName: string;
  insuranceCompanyName: string;
  adjusterName: string;
  adjusterPhoneNumber: string;
  adjusterEmail: string;
  insuranceClaimId: string;
  lossType: string;
  catCode?: number | null;
  humidity: string;
  temperature: string;
  forecast: string;
  lat: string;
  lng: string;
  claimSummary: string;
  assignmentNumber?: string;
  status?: ProjectStatus;
  roofSegments?: string[];
  roofSpecs?: {
    roofPitch: string;
  };
}

declare type TeamMember = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

declare type SearchResult = {
  publicId: string;
  name: string;
  location: string;
  clientEmail: string;
  clientPhoneNumber: string;
  companyName: string;
  managerName: string;
  adjusterEmail: string;
  adjusterName: string;
  adjusterPhoneNumber: string;
  insuranceCompanyName: string;
  insuranceClaimId: string;
  claimSummary: string;
  status: ProjectStatus;
  createdAt: string;
};

declare type RoomReading = {
  publicId: string;
  humidity: string | null;
  temperature: string | null;
  gpp: string | null;
  moistureContentWall: string | null;
  moistureContentFloor: string | null;
  date: Date;
  room: {
    publicId: string;
  };
  genericRoomReadings: {
    type: "dehumidifer";
    value: string;
    temperature: string;
    humidity: string;
    publicId: string;
  }[];
};
