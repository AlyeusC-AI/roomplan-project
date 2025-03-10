import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** GetUsers */
export interface GetUsers {
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
}
