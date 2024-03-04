import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimAssignmentStatus */
export interface GetClaimAssignmentStatus {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
}
