import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Diagrams } from "./Diagrams";
import { Estimate } from "./Estimate";

/** UpdateClaimEstimateResponse */
export interface UpdateClaimEstimateResponse {
    /** UpdateClaimEstimateResult */
    UpdateClaimEstimateResult?: AddClaimAssigneeResult;
    /** diagrams */
    diagrams?: Diagrams;
    /** estimate */
    estimate?: Estimate;
}
