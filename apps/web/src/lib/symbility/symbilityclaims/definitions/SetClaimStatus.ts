import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimStatus */
export interface SetClaimStatus {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** ClaimStatus|s:string|NotAssigned,AssignmentSent,AssignmentReceived,InsuredContacted,InspectionPerformed,EstimateCompleted,EstimateApproved,JobStarted,JobCompleted,Closed,Reopened,ClosedCashedOut,ClosedInvalid,ResolvedResidential,ResolvedCommercial,ResolvedContents,JobScheduled,ClosedCanceled,ClosedMerged,Opened,Contacted,Inspected,InProgress,AtRepair,Unknown */
    claimStatus?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
