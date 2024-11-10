// import { Organization, User, UserToOrganization } from '@servicegeek/db'

import { Project, ProjectStatus } from '@servicegeek/db'

export interface ProjectInfo {
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

const getProjectInfo = (project: Project) => {
  const {
    name,
    clientName,
    clientEmail,
    clientPhoneNumber,
    location,
    managerName,
    companyName,
    insuranceCompanyName,
    adjusterName,
    adjusterPhoneNumber,
    adjusterEmail,
    insuranceClaimId,
    lossType,
    catCode,
    humidity,
    temperature,
    forecast,
    wind,
    lat,
    lng,
    claimSummary,
    assignmentNumber,
    status,
    roofSegments,
    roofSpecs,
    id,
  } = project
  return {
    clientName: clientName || null,
    clientEmail,
    clientPhoneNumber,
    location,
    name,
    managerName,
    companyName,
    insuranceCompanyName,
    adjusterName,
    adjusterPhoneNumber,
    adjusterEmail,
    insuranceClaimId,
    lossType,
    catCode: catCode || null,
    humidity,
    temperature,
    forecast,
    wind,
    lat,
    lng,
    claimSummary,
    assignmentNumber,
    status,
    roofSegments: roofSegments || null,
    roofSpecs: roofSpecs || null,
    id,
  }
}

export default getProjectInfo
