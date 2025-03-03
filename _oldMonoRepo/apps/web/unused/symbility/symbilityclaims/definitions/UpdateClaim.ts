import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { ClaimUpdateSpecification } from "./ClaimUpdateSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** UpdateClaim */
export interface UpdateClaim {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** claimUpdateSpecification */
    claimUpdateSpecification?: ClaimUpdateSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
