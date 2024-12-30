import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimCustomFields */
export interface SetClaimCustomFields {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** customFields */
    customFields?: CustomFields;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
