import { Member } from '@components/Settings/Organization/types'
import {
  RoomData,
  RoomDataWithoutInferences,
} from '@restorationx/db/queries/project/getProjectDetections'
import { Stakeholders } from '@restorationx/db/queries/project/getUsersForProject'
import { ProjectType } from '@restorationx/db/queries/project/listProjects'
import { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import { ProjectInfo } from '@lib/serverSidePropsUtils/getProjectInfo'
import { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import { SubscriptionStatus } from '@restorationx/db'
import { FileObject } from '@supabase/storage-js'
import { MutableSnapshot } from 'recoil'
import { PresignedUrlMap } from '@pages/projects/[id]/photos'

import {
  CostDataType,
  laborCostsState,
  materialsCostsState,
  miscellaneousCostsState,
  subcontractorCostsState,
} from './costsState'
import equipmentState, { EquipmentStateType } from './equipmentState'
import inferencesState, { defaultInferencesState } from './inferencesState'
import orgInfoState, { defaultOrgInfoState } from './orgInfoState'
import presignedUrlMapState from './presignedUrlMapState'
import projectFilesState, {
  defaultProjectFilesState,
} from './projectFilesState'
import projectInfoState, { defaultProjectInfoState } from './projectInfoState'
import projectReportDataState, {
  defaultProjectReportDataState,
  ProjectReportData,
} from './projectReportDataState'
import projectsState from './projectsState'
import propertyDataInfoState, {
  PropertyDataInfo,
} from './propertyDataInfoState'
import roomState, { defaultRoomState } from './roomState'
import savedOptionsState, {
  defaultSavedOptionState,
  SavedOptionsState,
} from './savedOptionsState'
import stakeholderState, { defaultStakeholderState } from './stakeholderState'
import subscriptionStatusState from './subscriptionStatusState'
import teamMembersState, { defaultTeamMembersState } from './teamMembers'
import userInfoState, { defaultUserInfoState } from './userInfoState'

const initRecoilAtoms =
  ({
    inferences = defaultInferencesState,
    userInfo = defaultUserInfoState,
    orgInfo = defaultOrgInfoState,
    projectInfo = defaultProjectInfoState,
    rooms = defaultRoomState,
    projectFiles = defaultProjectFilesState,
    teamMembers = defaultTeamMembersState,
    stakeholders = defaultStakeholderState,
    propertyDataInfo = {},
    projectReportData = defaultProjectReportDataState,
    urlMap = {},
    projects = [],
    materialsCosts = [],
    subcontractorCosts = [],
    miscellaneousCosts = [],
    laborCosts = [],
    savedOptions = defaultSavedOptionState,
    equipment = [],
    subscriptionStatus = SubscriptionStatus.trialing,
  }: {
    inferences?: RoomData[]
    userInfo?: UserInfo
    orgInfo?: OrgInfo
    projectInfo?: ProjectInfo
    rooms?: RoomDataWithoutInferences[]
    projectFiles?: FileObject[]
    teamMembers?: Member[]
    stakeholders?: Stakeholders[]
    propertyDataInfo?: PropertyDataInfo
    projectReportData?: ProjectReportData | null
    urlMap?: PresignedUrlMap
    projects?: ProjectType[]
    materialsCosts?: CostDataType[]
    subcontractorCosts?: CostDataType[]
    miscellaneousCosts?: CostDataType[]
    laborCosts?: CostDataType[]
    savedOptions?: SavedOptionsState
    equipment?: EquipmentStateType[]
    subscriptionStatus?: SubscriptionStatus
  }) =>
  ({ set }: MutableSnapshot) => {
    set(inferencesState, inferences || [])
    set(userInfoState, userInfo)
    set(orgInfoState, orgInfo)
    set(projectInfoState, projectInfo)
    set(roomState, rooms)
    set(projectFilesState, projectFiles)
    set(teamMembersState, teamMembers)
    set(stakeholderState, stakeholders)
    set(propertyDataInfoState, propertyDataInfo)
    set(projectReportDataState, projectReportData)
    set(presignedUrlMapState, urlMap)
    set(projectsState, projects)
    set(materialsCostsState, materialsCosts)
    set(subcontractorCostsState, subcontractorCosts)
    set(miscellaneousCostsState, miscellaneousCosts)
    set(savedOptionsState, savedOptions)
    set(laborCostsState, laborCosts)
    set(equipmentState, equipment)
    set(subscriptionStatusState, subscriptionStatus)
  }

export default initRecoilAtoms
