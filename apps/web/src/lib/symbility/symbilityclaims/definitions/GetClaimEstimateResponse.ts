import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Estimate } from "./Estimate";

/** GetClaimEstimateResponse */
export interface GetClaimEstimateResponse {
    /** GetClaimEstimateResult */
    GetClaimEstimateResult?: AddClaimAssigneeResult;
    /** estimate */
    estimate?: Estimate;
}
