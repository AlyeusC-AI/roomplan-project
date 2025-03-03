import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Claim } from "./Claim";

/** GetClaimResponse */
export interface GetClaimResponse {
    /** GetClaimResult */
    GetClaimResult?: AddClaimAssigneeResult;
    /** claim */
    claim?: Claim;
}
