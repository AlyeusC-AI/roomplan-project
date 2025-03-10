import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { ClaimAssignment } from "./ClaimAssignment";

/** GetClaimAssignmentResponse */
export interface GetClaimAssignmentResponse {
    /** GetClaimAssignmentResult */
    GetClaimAssignmentResult?: AddClaimAssigneeResult;
    /** claimAssignment */
    claimAssignment?: ClaimAssignment;
}
