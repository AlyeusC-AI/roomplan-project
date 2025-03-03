import { ClaimAssignmentFilterSpecification } from "./ClaimAssignmentFilterSpecification";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";

/** GetClaimAssignment */
export interface GetClaimAssignment {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** claimAssignmentFilterSpecification */
    claimAssignmentFilterSpecification?: ClaimAssignmentFilterSpecification;
}
