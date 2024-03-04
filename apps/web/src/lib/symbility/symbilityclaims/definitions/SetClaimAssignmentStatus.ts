import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimAssignmentStatus */
export interface SetClaimAssignmentStatus {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** ClaimAssignmentStatus|s:string|None,NotAssigned,AssignmentSent,AssignmentReceived,InsuredContacted,InspectionScheduled,InspectionPerformed,EstimateCompleted,EstimateApproved,JobScheduled,JobStarted,JobCompleted,AssignmentCompleted,AssignmentCancelled,AssignmentDeclined,AssignmentReopened,Unknown,Multiple,MitigationWorkStarted,MitigationWorkCompleted,EstimateReadyForReview,JobNotSold */
    claimAssignmentStatus?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:dateTime */
    eventDate?: string;
}
