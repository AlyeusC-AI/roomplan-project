import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimAssignmentCustomFields */
export interface SetClaimAssignmentCustomFields {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** customFields */
    customFields?: CustomFields;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
