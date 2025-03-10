import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** RemoveClaimInternalAssignee */
export interface RemoveClaimInternalAssignee {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeUserIDSpecification */
    assigneeUserIDSpecification?: FromUserIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
