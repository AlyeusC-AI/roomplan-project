import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { Coverages } from "./Coverages";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** UpdateClaimCoverages */
export interface UpdateClaimCoverages {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** claimCoverages */
    claimCoverages?: Coverages;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
