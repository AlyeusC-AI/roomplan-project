import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimCurrentOwner */
export interface GetClaimCurrentOwner {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
}
