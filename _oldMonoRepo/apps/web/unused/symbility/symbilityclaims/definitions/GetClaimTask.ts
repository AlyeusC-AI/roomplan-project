import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimTask */
export interface GetClaimTask {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    taskID?: string;
}
