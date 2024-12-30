import {
  Client as SoapClient,
  createClientAsync as soapCreateClientAsync,
} from 'soap'

import { AddClaimAssignee } from './definitions/AddClaimAssignee'
import { AddClaimAssigneeGroup } from './definitions/AddClaimAssigneeGroup'
import { AddClaimAssigneeGroupResponse } from './definitions/AddClaimAssigneeGroupResponse'
import { AddClaimAssigneeRepairOptions } from './definitions/AddClaimAssigneeRepairOptions'
import { AddClaimAssigneeRepairOptionsResponse } from './definitions/AddClaimAssigneeRepairOptionsResponse'
import { AddClaimAssigneeResponse } from './definitions/AddClaimAssigneeResponse'
import { AddClaimAssigneeUserGroup } from './definitions/AddClaimAssigneeUserGroup'
import { AddClaimAssigneeUserGroupResponse } from './definitions/AddClaimAssigneeUserGroupResponse'
import { AddClaimExternalDocument } from './definitions/AddClaimExternalDocument'
import { AddClaimExternalDocumentResponse } from './definitions/AddClaimExternalDocumentResponse'
import { AddClaimInternalAssignee } from './definitions/AddClaimInternalAssignee'
import { AddClaimInternalAssigneeResponse } from './definitions/AddClaimInternalAssigneeResponse'
import { AddClaimJournalEntry } from './definitions/AddClaimJournalEntry'
import { AddClaimJournalEntryResponse } from './definitions/AddClaimJournalEntryResponse'
import { AddClaimPhotos } from './definitions/AddClaimPhotos'
import { AddClaimPhotosResponse } from './definitions/AddClaimPhotosResponse'
import { AddClaimQuestionnaire } from './definitions/AddClaimQuestionnaire'
import { AddClaimQuestionnaireResponse } from './definitions/AddClaimQuestionnaireResponse'
import { AddClaimUser } from './definitions/AddClaimUser'
import { AddClaimUserResponse } from './definitions/AddClaimUserResponse'
import { CompleteClaimQuestionnaire } from './definitions/CompleteClaimQuestionnaire'
import { CompleteClaimQuestionnaireResponse } from './definitions/CompleteClaimQuestionnaireResponse'
import { CreateCalendarEvent } from './definitions/CreateCalendarEvent'
import { CreateCalendarEventResponse } from './definitions/CreateCalendarEventResponse'
import { CreateClaim } from './definitions/CreateClaim'
import { CreateClaimEstimate } from './definitions/CreateClaimEstimate'
import { CreateClaimEstimateResponse } from './definitions/CreateClaimEstimateResponse'
import { CreateClaimResponse } from './definitions/CreateClaimResponse'
import { CreateClaimTask } from './definitions/CreateClaimTask'
import { CreateClaimTaskFromTemplate } from './definitions/CreateClaimTaskFromTemplate'
import { CreateClaimTaskFromTemplateResponse } from './definitions/CreateClaimTaskFromTemplateResponse'
import { CreateClaimTaskResponse } from './definitions/CreateClaimTaskResponse'
import { CreateUser } from './definitions/CreateUser'
import { CreateUserResponse } from './definitions/CreateUserResponse'
import { DeleteCalendarEvent } from './definitions/DeleteCalendarEvent'
import { DeleteCalendarEventResponse } from './definitions/DeleteCalendarEventResponse'
import { DeleteClaimTask } from './definitions/DeleteClaimTask'
import { DeleteClaimTaskResponse } from './definitions/DeleteClaimTaskResponse'
import { GetCalendarEvent } from './definitions/GetCalendarEvent'
import { GetCalendarEventResponse } from './definitions/GetCalendarEventResponse'
import { GetCalendarEvents } from './definitions/GetCalendarEvents'
import { GetCalendarEventsResponse } from './definitions/GetCalendarEventsResponse'
import { GetClaim } from './definitions/GetClaim'
import { GetClaimAssignment } from './definitions/GetClaimAssignment'
import { GetClaimAssignmentResponse } from './definitions/GetClaimAssignmentResponse'
import { GetClaimAssignmentStatus } from './definitions/GetClaimAssignmentStatus'
import { GetClaimAssignmentStatusResponse } from './definitions/GetClaimAssignmentStatusResponse'
import { GetClaimContact } from './definitions/GetClaimContact'
import { GetClaimContactResponse } from './definitions/GetClaimContactResponse'
import { GetClaimCurrentOwner } from './definitions/GetClaimCurrentOwner'
import { GetClaimCurrentOwnerResponse } from './definitions/GetClaimCurrentOwnerResponse'
import { GetClaimDiagram } from './definitions/GetClaimDiagram'
import { GetClaimDiagramResponse } from './definitions/GetClaimDiagramResponse'
import { GetClaimDocumentV2 } from './definitions/GetClaimDocumentV2'
import { GetClaimDocumentV2Response } from './definitions/GetClaimDocumentV2Response'
import { GetClaimDocumentV2Response1 } from './definitions/GetClaimDocumentV2Response1'
import { GetClaimDocumentV21 } from './definitions/GetClaimDocumentV21'
import { GetClaimEstimate } from './definitions/GetClaimEstimate'
import { GetClaimEstimateResponse } from './definitions/GetClaimEstimateResponse'
import { GetClaimExternalDocument } from './definitions/GetClaimExternalDocument'
import { GetClaimExternalDocumentResponse } from './definitions/GetClaimExternalDocumentResponse'
import { GetClaimForm } from './definitions/GetClaimForm'
import { GetClaimFormResponse } from './definitions/GetClaimFormResponse'
import { GetClaimPhoto } from './definitions/GetClaimPhoto'
import { GetClaimPhotoResponse } from './definitions/GetClaimPhotoResponse'
import { GetClaimQuestionnaire } from './definitions/GetClaimQuestionnaire'
import { GetClaimQuestionnaireResponse } from './definitions/GetClaimQuestionnaireResponse'
import { GetClaimResponse } from './definitions/GetClaimResponse'
import { GetClaimStatus } from './definitions/GetClaimStatus'
import { GetClaimStatusResponse } from './definitions/GetClaimStatusResponse'
import { GetClaimTask } from './definitions/GetClaimTask'
import { GetClaimTaskList } from './definitions/GetClaimTaskList'
import { GetClaimTaskListResponse } from './definitions/GetClaimTaskListResponse'
import { GetClaimTaskResponse } from './definitions/GetClaimTaskResponse'
import { GetClaimVoiceAnnotation } from './definitions/GetClaimVoiceAnnotation'
import { GetClaimVoiceAnnotationResponse } from './definitions/GetClaimVoiceAnnotationResponse'
import { GetHandwrittenNote } from './definitions/GetHandwrittenNote'
import { GetHandwrittenNoteResponse } from './definitions/GetHandwrittenNoteResponse'
import { GetUsers } from './definitions/GetUsers'
import { GetUsersResponse } from './definitions/GetUsersResponse'
import { ImportClaimDiagram } from './definitions/ImportClaimDiagram'
import { ImportClaimDiagramResponse } from './definitions/ImportClaimDiagramResponse'
import { RemoveClaimAssignee } from './definitions/RemoveClaimAssignee'
import { RemoveClaimAssigneeResponse } from './definitions/RemoveClaimAssigneeResponse'
import { RemoveClaimInternalAssignee } from './definitions/RemoveClaimInternalAssignee'
import { RemoveClaimInternalAssigneeResponse } from './definitions/RemoveClaimInternalAssigneeResponse'
import { RemoveClaimUser } from './definitions/RemoveClaimUser'
import { RemoveClaimUserResponse } from './definitions/RemoveClaimUserResponse'
import { ResetUserPassword } from './definitions/ResetUserPassword'
import { ResetUserPasswordResponse } from './definitions/ResetUserPasswordResponse'
import { SetCalendarEvent } from './definitions/SetCalendarEvent'
import { SetCalendarEventResponse } from './definitions/SetCalendarEventResponse'
import { SetClaimAssignmentCustomFields } from './definitions/SetClaimAssignmentCustomFields'
import { SetClaimAssignmentCustomFieldsResponse } from './definitions/SetClaimAssignmentCustomFieldsResponse'
import { SetClaimAssignmentStatus } from './definitions/SetClaimAssignmentStatus'
import { SetClaimAssignmentStatusInspectionScheduled } from './definitions/SetClaimAssignmentStatusInspectionScheduled'
import { SetClaimAssignmentStatusInspectionScheduledResponse } from './definitions/SetClaimAssignmentStatusInspectionScheduledResponse'
import { SetClaimAssignmentStatusJobScheduled } from './definitions/SetClaimAssignmentStatusJobScheduled'
import { SetClaimAssignmentStatusJobScheduledResponse } from './definitions/SetClaimAssignmentStatusJobScheduledResponse'
import { SetClaimAssignmentStatusResponse } from './definitions/SetClaimAssignmentStatusResponse'
import { SetClaimContact } from './definitions/SetClaimContact'
import { SetClaimContactResponse } from './definitions/SetClaimContactResponse'
import { SetClaimCustomFields } from './definitions/SetClaimCustomFields'
import { SetClaimCustomFieldsResponse } from './definitions/SetClaimCustomFieldsResponse'
import { SetClaimPaymentStatus } from './definitions/SetClaimPaymentStatus'
import { SetClaimPaymentStatusResponse } from './definitions/SetClaimPaymentStatusResponse'
import { SetClaimStatus } from './definitions/SetClaimStatus'
import { SetClaimStatusResponse } from './definitions/SetClaimStatusResponse'
import { SetEstimateFinalization } from './definitions/SetEstimateFinalization'
import { SetEstimateFinalizationResponse } from './definitions/SetEstimateFinalizationResponse'
import { SetEstimateStatus } from './definitions/SetEstimateStatus'
import { SetEstimateStatusResponse } from './definitions/SetEstimateStatusResponse'
import { UnblockUser } from './definitions/UnblockUser'
import { UnblockUserResponse } from './definitions/UnblockUserResponse'
import { UpdateApiNotificationWebServiceKeys } from './definitions/UpdateApiNotificationWebServiceKeys'
import { UpdateApiNotificationWebServiceKeysResponse } from './definitions/UpdateApiNotificationWebServiceKeysResponse'
import { UpdateApiPassword } from './definitions/UpdateApiPassword'
import { UpdateApiPasswordResponse } from './definitions/UpdateApiPasswordResponse'
import { UpdateClaim } from './definitions/UpdateClaim'
import { UpdateClaimCoverages } from './definitions/UpdateClaimCoverages'
import { UpdateClaimCoveragesResponse } from './definitions/UpdateClaimCoveragesResponse'
import { UpdateClaimEstimate } from './definitions/UpdateClaimEstimate'
import { UpdateClaimEstimateResponse } from './definitions/UpdateClaimEstimateResponse'
import { UpdateClaimEstimateScore } from './definitions/UpdateClaimEstimateScore'
import { UpdateClaimEstimateScoreResponse } from './definitions/UpdateClaimEstimateScoreResponse'
import { UpdateClaimResponse } from './definitions/UpdateClaimResponse'
import { UpdateClaimTask } from './definitions/UpdateClaimTask'
import { UpdateClaimTaskResponse } from './definitions/UpdateClaimTaskResponse'
import { UpdateCompanies } from './definitions/UpdateCompanies'
import { UpdateCompaniesResponse } from './definitions/UpdateCompaniesResponse'
import { UpdateUser } from './definitions/UpdateUser'
import { UpdateUserResponse } from './definitions/UpdateUserResponse'
import { UpdateUsers } from './definitions/UpdateUsers'
import { UpdateUsersResponse } from './definitions/UpdateUsersResponse'
import { SymbilityClaimsService } from './services/SymbilityClaimsService'

export interface SymbilityClaimsClient extends SoapClient {
  SymbilityClaimsService: SymbilityClaimsService
  AddClaimAssigneeAsync(
    addClaimAssignee: AddClaimAssignee
  ): Promise<
    [
      result: AddClaimAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeGroupAsync(
    addClaimAssigneeGroup: AddClaimAssigneeGroup
  ): Promise<
    [
      result: AddClaimAssigneeGroupResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeUserGroupAsync(
    addClaimAssigneeUserGroup: AddClaimAssigneeUserGroup
  ): Promise<
    [
      result: AddClaimAssigneeUserGroupResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimInternalAssigneeAsync(
    addClaimInternalAssignee: AddClaimInternalAssignee
  ): Promise<
    [
      result: AddClaimInternalAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimJournalEntryAsync(
    addClaimJournalEntry: AddClaimJournalEntry
  ): Promise<
    [
      result: AddClaimJournalEntryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimPhotosAsync(
    addClaimPhotos: AddClaimPhotos
  ): Promise<
    [
      result: AddClaimPhotosResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimUserAsync(
    addClaimUser: AddClaimUser
  ): Promise<
    [
      result: AddClaimUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimExternalDocumentAsync(
    addClaimExternalDocument: AddClaimExternalDocument
  ): Promise<
    [
      result: AddClaimExternalDocumentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateCalendarEventAsync(
    createCalendarEvent: CreateCalendarEvent
  ): Promise<
    [
      result: CreateCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimAsync(
    createClaim: CreateClaim
  ): Promise<
    [
      result: CreateClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimEstimateAsync(
    createClaimEstimate: CreateClaimEstimate
  ): Promise<
    [
      result: CreateClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimEstimateAsync(
    updateClaimEstimate: UpdateClaimEstimate
  ): Promise<
    [
      result: UpdateClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  DeleteCalendarEventAsync(
    deleteCalendarEvent: DeleteCalendarEvent
  ): Promise<
    [
      result: DeleteCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetCalendarEventAsync(
    getCalendarEvent: GetCalendarEvent
  ): Promise<
    [
      result: GetCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetCalendarEventsAsync(
    getCalendarEvents: GetCalendarEvents
  ): Promise<
    [
      result: GetCalendarEventsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAsync(
    getClaim: GetClaim
  ): Promise<
    [
      result: GetClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAssignmentAsync(
    getClaimAssignment: GetClaimAssignment
  ): Promise<
    [
      result: GetClaimAssignmentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimContactAsync(
    getClaimContact: GetClaimContact
  ): Promise<
    [
      result: GetClaimContactResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimCurrentOwnerAsync(
    getClaimCurrentOwner: GetClaimCurrentOwner
  ): Promise<
    [
      result: GetClaimCurrentOwnerResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimDiagramAsync(
    getClaimDiagram: GetClaimDiagram
  ): Promise<
    [
      result: GetClaimDiagramResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  ImportClaimDiagramAsync(
    importClaimDiagram: ImportClaimDiagram
  ): Promise<
    [
      result: ImportClaimDiagramResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimDocument_v2Async(
    getClaimDocumentV2: GetClaimDocumentV2
  ): Promise<
    [
      result: GetClaimDocumentV2Response,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimEstimateAsync(
    getClaimEstimate: GetClaimEstimate
  ): Promise<
    [
      result: GetClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimFormAsync(
    getClaimForm: GetClaimForm
  ): Promise<
    [
      result: GetClaimFormResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimPhotoAsync(
    getClaimPhoto: GetClaimPhoto
  ): Promise<
    [
      result: GetClaimPhotoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimVoiceAnnotationAsync(
    getClaimVoiceAnnotation: GetClaimVoiceAnnotation
  ): Promise<
    [
      result: GetClaimVoiceAnnotationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimExternalDocumentAsync(
    getClaimExternalDocument: GetClaimExternalDocument
  ): Promise<
    [
      result: GetClaimExternalDocumentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetHandwrittenNoteAsync(
    getHandwrittenNote: GetHandwrittenNote
  ): Promise<
    [
      result: GetHandwrittenNoteResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimStatusAsync(
    getClaimStatus: GetClaimStatus
  ): Promise<
    [
      result: GetClaimStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAssignmentStatusAsync(
    getClaimAssignmentStatus: GetClaimAssignmentStatus
  ): Promise<
    [
      result: GetClaimAssignmentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimInternalAssigneeAsync(
    removeClaimInternalAssignee: RemoveClaimInternalAssignee
  ): Promise<
    [
      result: RemoveClaimInternalAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimAssigneeAsync(
    removeClaimAssignee: RemoveClaimAssignee
  ): Promise<
    [
      result: RemoveClaimAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimUserAsync(
    removeClaimUser: RemoveClaimUser
  ): Promise<
    [
      result: RemoveClaimUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetCalendarEventAsync(
    setCalendarEvent: SetCalendarEvent
  ): Promise<
    [
      result: SetCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimContactAsync(
    setClaimContact: SetClaimContact
  ): Promise<
    [
      result: SetClaimContactResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimCustomFieldsAsync(
    setClaimCustomFields: SetClaimCustomFields
  ): Promise<
    [
      result: SetClaimCustomFieldsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentCustomFieldsAsync(
    setClaimAssignmentCustomFields: SetClaimAssignmentCustomFields
  ): Promise<
    [
      result: SetClaimAssignmentCustomFieldsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimPaymentStatusAsync(
    setClaimPaymentStatus: SetClaimPaymentStatus
  ): Promise<
    [
      result: SetClaimPaymentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimStatusAsync(
    setClaimStatus: SetClaimStatus
  ): Promise<
    [
      result: SetClaimStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetEstimateStatusAsync(
    setEstimateStatus: SetEstimateStatus
  ): Promise<
    [
      result: SetEstimateStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetEstimateFinalizationAsync(
    setEstimateFinalization: SetEstimateFinalization
  ): Promise<
    [
      result: SetEstimateFinalizationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusAsync(
    setClaimAssignmentStatus: SetClaimAssignmentStatus
  ): Promise<
    [
      result: SetClaimAssignmentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusInspectionScheduledAsync(
    setClaimAssignmentStatusInspectionScheduled: SetClaimAssignmentStatusInspectionScheduled
  ): Promise<
    [
      result: SetClaimAssignmentStatusInspectionScheduledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusJobScheduledAsync(
    setClaimAssignmentStatusJobScheduled: SetClaimAssignmentStatusJobScheduled
  ): Promise<
    [
      result: SetClaimAssignmentStatusJobScheduledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateCompaniesAsync(
    updateCompanies: UpdateCompanies
  ): Promise<
    [
      result: UpdateCompaniesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateUsersAsync(
    updateUsers: UpdateUsers
  ): Promise<
    [
      result: UpdateUsersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateUserAsync(
    createUser: CreateUser
  ): Promise<
    [
      result: CreateUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateUserAsync(
    updateUser: UpdateUser
  ): Promise<
    [
      result: UpdateUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  ResetUserPasswordAsync(
    resetUserPassword: ResetUserPassword
  ): Promise<
    [
      result: ResetUserPasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UnblockUserAsync(
    unblockUser: UnblockUser
  ): Promise<
    [
      result: UnblockUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetUsersAsync(
    getUsers: GetUsers
  ): Promise<
    [
      result: GetUsersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimAsync(
    updateClaim: UpdateClaim
  ): Promise<
    [
      result: UpdateClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimCoveragesAsync(
    updateClaimCoverages: UpdateClaimCoverages
  ): Promise<
    [
      result: UpdateClaimCoveragesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimTaskAsync(
    createClaimTask: CreateClaimTask
  ): Promise<
    [
      result: CreateClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimTaskFromTemplateAsync(
    createClaimTaskFromTemplate: CreateClaimTaskFromTemplate
  ): Promise<
    [
      result: CreateClaimTaskFromTemplateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimTaskAsync(
    updateClaimTask: UpdateClaimTask
  ): Promise<
    [
      result: UpdateClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  DeleteClaimTaskAsync(
    deleteClaimTask: DeleteClaimTask
  ): Promise<
    [
      result: DeleteClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimTaskAsync(
    getClaimTask: GetClaimTask
  ): Promise<
    [
      result: GetClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimTaskListAsync(
    getClaimTaskList: GetClaimTaskList
  ): Promise<
    [
      result: GetClaimTaskListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeRepairOptionsAsync(
    addClaimAssigneeRepairOptions: AddClaimAssigneeRepairOptions
  ): Promise<
    [
      result: AddClaimAssigneeRepairOptionsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimQuestionnaireAsync(
    addClaimQuestionnaire: AddClaimQuestionnaire
  ): Promise<
    [
      result: AddClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimQuestionnaireAsync(
    getClaimQuestionnaire: GetClaimQuestionnaire
  ): Promise<
    [
      result: GetClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateApiPasswordAsync(
    updateApiPassword: UpdateApiPassword
  ): Promise<
    [
      result: UpdateApiPasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateApiNotificationWebServiceKeysAsync(
    updateApiNotificationWebServiceKeys: UpdateApiNotificationWebServiceKeys
  ): Promise<
    [
      result: UpdateApiNotificationWebServiceKeysResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimEstimateScoreAsync(
    updateClaimEstimateScore: UpdateClaimEstimateScore
  ): Promise<
    [
      result: UpdateClaimEstimateScoreResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CompleteClaimQuestionnaireAsync(
    completeClaimQuestionnaire: CompleteClaimQuestionnaire
  ): Promise<
    [
      result: CompleteClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeAsync(
    addClaimAssignee: AddClaimAssignee
  ): Promise<
    [
      result: AddClaimAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeGroupAsync(
    addClaimAssigneeGroup: AddClaimAssigneeGroup
  ): Promise<
    [
      result: AddClaimAssigneeGroupResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeUserGroupAsync(
    addClaimAssigneeUserGroup: AddClaimAssigneeUserGroup
  ): Promise<
    [
      result: AddClaimAssigneeUserGroupResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimInternalAssigneeAsync(
    addClaimInternalAssignee: AddClaimInternalAssignee
  ): Promise<
    [
      result: AddClaimInternalAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimJournalEntryAsync(
    addClaimJournalEntry: AddClaimJournalEntry
  ): Promise<
    [
      result: AddClaimJournalEntryResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimPhotosAsync(
    addClaimPhotos: AddClaimPhotos
  ): Promise<
    [
      result: AddClaimPhotosResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimUserAsync(
    addClaimUser: AddClaimUser
  ): Promise<
    [
      result: AddClaimUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimExternalDocumentAsync(
    addClaimExternalDocument: AddClaimExternalDocument
  ): Promise<
    [
      result: AddClaimExternalDocumentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateCalendarEventAsync(
    createCalendarEvent: CreateCalendarEvent
  ): Promise<
    [
      result: CreateCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimAsync(
    createClaim: CreateClaim
  ): Promise<
    [
      result: CreateClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimEstimateAsync(
    createClaimEstimate: CreateClaimEstimate
  ): Promise<
    [
      result: CreateClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimEstimateAsync(
    updateClaimEstimate: UpdateClaimEstimate
  ): Promise<
    [
      result: UpdateClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  DeleteCalendarEventAsync(
    deleteCalendarEvent: DeleteCalendarEvent
  ): Promise<
    [
      result: DeleteCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetCalendarEventAsync(
    getCalendarEvent: GetCalendarEvent
  ): Promise<
    [
      result: GetCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetCalendarEventsAsync(
    getCalendarEvents: GetCalendarEvents
  ): Promise<
    [
      result: GetCalendarEventsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAsync(
    getClaim: GetClaim
  ): Promise<
    [
      result: GetClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAssignmentAsync(
    getClaimAssignment: GetClaimAssignment
  ): Promise<
    [
      result: GetClaimAssignmentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimContactAsync(
    getClaimContact: GetClaimContact
  ): Promise<
    [
      result: GetClaimContactResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimCurrentOwnerAsync(
    getClaimCurrentOwner: GetClaimCurrentOwner
  ): Promise<
    [
      result: GetClaimCurrentOwnerResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimDiagramAsync(
    getClaimDiagram: GetClaimDiagram
  ): Promise<
    [
      result: GetClaimDiagramResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  ImportClaimDiagramAsync(
    importClaimDiagram: ImportClaimDiagram
  ): Promise<
    [
      result: ImportClaimDiagramResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimDocument_v2Async(
    getClaimDocumentV2: GetClaimDocumentV21
  ): Promise<
    [
      result: GetClaimDocumentV2Response1,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimEstimateAsync(
    getClaimEstimate: GetClaimEstimate
  ): Promise<
    [
      result: GetClaimEstimateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimFormAsync(
    getClaimForm: GetClaimForm
  ): Promise<
    [
      result: GetClaimFormResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimPhotoAsync(
    getClaimPhoto: GetClaimPhoto
  ): Promise<
    [
      result: GetClaimPhotoResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimVoiceAnnotationAsync(
    getClaimVoiceAnnotation: GetClaimVoiceAnnotation
  ): Promise<
    [
      result: GetClaimVoiceAnnotationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimExternalDocumentAsync(
    getClaimExternalDocument: GetClaimExternalDocument
  ): Promise<
    [
      result: GetClaimExternalDocumentResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetHandwrittenNoteAsync(
    getHandwrittenNote: GetHandwrittenNote
  ): Promise<
    [
      result: GetHandwrittenNoteResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimStatusAsync(
    getClaimStatus: GetClaimStatus
  ): Promise<
    [
      result: GetClaimStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimAssignmentStatusAsync(
    getClaimAssignmentStatus: GetClaimAssignmentStatus
  ): Promise<
    [
      result: GetClaimAssignmentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimInternalAssigneeAsync(
    removeClaimInternalAssignee: RemoveClaimInternalAssignee
  ): Promise<
    [
      result: RemoveClaimInternalAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimAssigneeAsync(
    removeClaimAssignee: RemoveClaimAssignee
  ): Promise<
    [
      result: RemoveClaimAssigneeResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  RemoveClaimUserAsync(
    removeClaimUser: RemoveClaimUser
  ): Promise<
    [
      result: RemoveClaimUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetCalendarEventAsync(
    setCalendarEvent: SetCalendarEvent
  ): Promise<
    [
      result: SetCalendarEventResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimContactAsync(
    setClaimContact: SetClaimContact
  ): Promise<
    [
      result: SetClaimContactResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimCustomFieldsAsync(
    setClaimCustomFields: SetClaimCustomFields
  ): Promise<
    [
      result: SetClaimCustomFieldsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentCustomFieldsAsync(
    setClaimAssignmentCustomFields: SetClaimAssignmentCustomFields
  ): Promise<
    [
      result: SetClaimAssignmentCustomFieldsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimPaymentStatusAsync(
    setClaimPaymentStatus: SetClaimPaymentStatus
  ): Promise<
    [
      result: SetClaimPaymentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimStatusAsync(
    setClaimStatus: SetClaimStatus
  ): Promise<
    [
      result: SetClaimStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetEstimateStatusAsync(
    setEstimateStatus: SetEstimateStatus
  ): Promise<
    [
      result: SetEstimateStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetEstimateFinalizationAsync(
    setEstimateFinalization: SetEstimateFinalization
  ): Promise<
    [
      result: SetEstimateFinalizationResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusAsync(
    setClaimAssignmentStatus: SetClaimAssignmentStatus
  ): Promise<
    [
      result: SetClaimAssignmentStatusResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusInspectionScheduledAsync(
    setClaimAssignmentStatusInspectionScheduled: SetClaimAssignmentStatusInspectionScheduled
  ): Promise<
    [
      result: SetClaimAssignmentStatusInspectionScheduledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  SetClaimAssignmentStatusJobScheduledAsync(
    setClaimAssignmentStatusJobScheduled: SetClaimAssignmentStatusJobScheduled
  ): Promise<
    [
      result: SetClaimAssignmentStatusJobScheduledResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateCompaniesAsync(
    updateCompanies: UpdateCompanies
  ): Promise<
    [
      result: UpdateCompaniesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateUsersAsync(
    updateUsers: UpdateUsers
  ): Promise<
    [
      result: UpdateUsersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateUserAsync(
    createUser: CreateUser
  ): Promise<
    [
      result: CreateUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateUserAsync(
    updateUser: UpdateUser
  ): Promise<
    [
      result: UpdateUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  ResetUserPasswordAsync(
    resetUserPassword: ResetUserPassword
  ): Promise<
    [
      result: ResetUserPasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UnblockUserAsync(
    unblockUser: UnblockUser
  ): Promise<
    [
      result: UnblockUserResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetUsersAsync(
    getUsers: GetUsers
  ): Promise<
    [
      result: GetUsersResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimAsync(
    updateClaim: UpdateClaim
  ): Promise<
    [
      result: UpdateClaimResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimCoveragesAsync(
    updateClaimCoverages: UpdateClaimCoverages
  ): Promise<
    [
      result: UpdateClaimCoveragesResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimTaskAsync(
    createClaimTask: CreateClaimTask
  ): Promise<
    [
      result: CreateClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CreateClaimTaskFromTemplateAsync(
    createClaimTaskFromTemplate: CreateClaimTaskFromTemplate
  ): Promise<
    [
      result: CreateClaimTaskFromTemplateResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimTaskAsync(
    updateClaimTask: UpdateClaimTask
  ): Promise<
    [
      result: UpdateClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  DeleteClaimTaskAsync(
    deleteClaimTask: DeleteClaimTask
  ): Promise<
    [
      result: DeleteClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimTaskAsync(
    getClaimTask: GetClaimTask
  ): Promise<
    [
      result: GetClaimTaskResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimTaskListAsync(
    getClaimTaskList: GetClaimTaskList
  ): Promise<
    [
      result: GetClaimTaskListResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimAssigneeRepairOptionsAsync(
    addClaimAssigneeRepairOptions: AddClaimAssigneeRepairOptions
  ): Promise<
    [
      result: AddClaimAssigneeRepairOptionsResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  AddClaimQuestionnaireAsync(
    addClaimQuestionnaire: AddClaimQuestionnaire
  ): Promise<
    [
      result: AddClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  GetClaimQuestionnaireAsync(
    getClaimQuestionnaire: GetClaimQuestionnaire
  ): Promise<
    [
      result: GetClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateApiPasswordAsync(
    updateApiPassword: UpdateApiPassword
  ): Promise<
    [
      result: UpdateApiPasswordResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateApiNotificationWebServiceKeysAsync(
    updateApiNotificationWebServiceKeys: UpdateApiNotificationWebServiceKeys
  ): Promise<
    [
      result: UpdateApiNotificationWebServiceKeysResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  UpdateClaimEstimateScoreAsync(
    updateClaimEstimateScore: UpdateClaimEstimateScore
  ): Promise<
    [
      result: UpdateClaimEstimateScoreResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
  CompleteClaimQuestionnaireAsync(
    completeClaimQuestionnaire: CompleteClaimQuestionnaire
  ): Promise<
    [
      result: CompleteClaimQuestionnaireResponse,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any
    ]
  >
}

/** Create SymbilityClaimsClient */
export function createClientAsync(
  ...args: Parameters<typeof soapCreateClientAsync>
): Promise<SymbilityClaimsClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any
}
