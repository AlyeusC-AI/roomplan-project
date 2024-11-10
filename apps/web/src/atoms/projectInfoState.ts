import { ProjectInfo } from '@lib/serverSidePropsUtils/getProjectInfo'
import { ProjectStatus } from '@servicegeek/db'
import { atom } from 'recoil'

export const defaultProjectInfoState = {
  clientName: '',
  clientEmail: '',
  clientPhoneNumber: '',
  location: '',
  name: '',
  managerName: '',
  companyName: '',
  insuranceCompanyName: '',
  adjusterName: '',
  adjusterPhoneNumber: '',
  adjusterEmail: '',
  insuranceClaimId: '',
  lossType: '',
  catCode: undefined,
  humidity: '',
  temperature: '',
  forecast: '',
  wind: '',
  lat: '',
  lng: '',
  claimSummary: '',
  assignmentNumber: '',
  status: ProjectStatus.active,
  roofSegments: [],
  roofSpecs: undefined,
  id: 0,
}

const projectInfoState = atom<ProjectInfo>({
  key: 'ProjectInfoState',
  default: defaultProjectInfoState,
})

export default projectInfoState
