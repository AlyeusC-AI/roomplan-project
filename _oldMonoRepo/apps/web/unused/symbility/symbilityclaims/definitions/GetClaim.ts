import { ClaimFilterSpecification } from "./ClaimFilterSpecification";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaim */
export interface GetClaim {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** claimFilterSpecification */
    claimFilterSpecification?: ClaimFilterSpecification;
}
