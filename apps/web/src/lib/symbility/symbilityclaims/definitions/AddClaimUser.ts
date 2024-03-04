import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimUser */
export interface AddClaimUser {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** addUserIDSpecification */
    addUserIDSpecification?: FromUserIdSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
