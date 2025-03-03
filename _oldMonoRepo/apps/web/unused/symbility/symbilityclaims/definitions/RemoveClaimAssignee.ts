import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** RemoveClaimAssignee */
export interface RemoveClaimAssignee {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeCompanyIDSpecification */
    assigneeCompanyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
