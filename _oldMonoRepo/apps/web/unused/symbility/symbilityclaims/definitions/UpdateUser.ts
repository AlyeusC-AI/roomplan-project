import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";
import { UserProfileUpdateSpecification } from "./UserProfileUpdateSpecification";

/** UpdateUser */
export interface UpdateUser {
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** userIDSpecification */
    userIDSpecification?: FromUserIdSpecification;
    /** userProfileUpdateSpecification */
    userProfileUpdateSpecification?: UserProfileUpdateSpecification;
}
