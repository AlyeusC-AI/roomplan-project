import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** UnblockUser */
export interface UnblockUser {
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
}
