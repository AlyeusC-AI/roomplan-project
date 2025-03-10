import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { UserProfileSpecification } from "./UserProfileSpecification";

/** CreateUser */
export interface CreateUser {
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** userProfileSpecification */
    userProfileSpecification?: UserProfileSpecification;
}
