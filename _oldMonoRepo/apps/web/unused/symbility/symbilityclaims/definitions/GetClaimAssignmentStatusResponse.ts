import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";

/** GetClaimAssignmentStatusResponse */
export interface GetClaimAssignmentStatusResponse {
    /** GetClaimAssignmentStatusResult */
    GetClaimAssignmentStatusResult?: AddClaimAssigneeResult;
    /** ClaimAssignmentStatus|s:string|None,NotAssigned,AssignmentSent,AssignmentReceived,InsuredContacted,InspectionScheduled,InspectionPerformed,EstimateCompleted,EstimateApproved,JobScheduled,JobStarted,JobCompleted,AssignmentCompleted,AssignmentCancelled,AssignmentDeclined,AssignmentReopened,Unknown,Multiple,MitigationWorkStarted,MitigationWorkCompleted,EstimateReadyForReview,JobNotSold */
    claimAssignmentStatus?: string;
}
