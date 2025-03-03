import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** ResetUserPassword */
export interface ResetUserPassword {
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
}
