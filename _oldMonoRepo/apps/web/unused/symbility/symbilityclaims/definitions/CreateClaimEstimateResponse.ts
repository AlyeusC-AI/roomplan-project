import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { Diagrams } from "./Diagrams";
import { Estimate } from "./Estimate";

/** CreateClaimEstimateResponse */
export interface CreateClaimEstimateResponse {
    /** CreateClaimEstimateResult */
    CreateClaimEstimateResult?: AddClaimAssigneeResult;
    /** diagrams */
    diagrams?: Diagrams;
    /** estimate */
    estimate?: Estimate;
}
