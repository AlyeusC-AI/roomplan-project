import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";

/** GetClaimStatusResponse */
export interface GetClaimStatusResponse {
    /** GetClaimStatusResult */
    GetClaimStatusResult?: AddClaimAssigneeResult;
    /** ClaimStatus|s:string|NotAssigned,AssignmentSent,AssignmentReceived,InsuredContacted,InspectionPerformed,EstimateCompleted,EstimateApproved,JobStarted,JobCompleted,Closed,Reopened,ClosedCashedOut,ClosedInvalid,ResolvedResidential,ResolvedCommercial,ResolvedContents,JobScheduled,ClosedCanceled,ClosedMerged,Opened,Contacted,Inspected,InProgress,AtRepair,Unknown */
    claimStatus?: string;
}
