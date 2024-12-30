interface ProjectInfo {
  name: string
  clientName: string
  clientEmail: string
  clientPhoneNumber: string
  location: string
  managerName: string
  companyName: string
  insuranceCompanyName: string
  adjusterName: string
  adjusterPhoneNumber: string
  adjusterEmail: string
  insuranceClaimId: string
  lossType: string
  catCode?: number | null
  humidity: string
  temperature: string
  wind: string
  forecast: string
  lat: string
  lng: string
  claimSummary: string
  assignmentNumber?: string
  status?: ProjectStatus
  roofSegments?: string[]
  roofSpecs?: {
    roofPitch: string
  }
  id: number
  refferal?: string
}

type CostData = {
  id: string
  name: string
  actualCost: number
  estimatedCost: number
}

type CostDataType = "subcontractor" | "materials" | "miscellaneous" | "labor"

type ProjectStatus = 'active' | 'mitigation' | 'inspection' | 'review' | 'completed' | 'inactive' | 'incomplete'

type AreaAffectedType = 'wall' | 'floor' | 'ceiling'

type AffectedAreaData = {
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cause?: string;
  category?: number;
  cabinetryRemoved?: string;
  isDeleted?: boolean;
};

type DimensionData = {
  length?: string
  width?: string
  height?: string
  totalSqft?: string
  windows?: number
  doors?: number
  equipmentUsed?: string[]
}
