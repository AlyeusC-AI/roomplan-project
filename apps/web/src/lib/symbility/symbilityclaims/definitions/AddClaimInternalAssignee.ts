import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { ClaimUserRoleSpecification } from "./ClaimUserRoleSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimInternalAssignee */
export interface AddClaimInternalAssignee {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** s:string */
    assignmentTypeCode?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeUserIDSpecification */
    assigneeUserIDSpecification?: FromUserIdSpecification;
    /** claimUserRoleSpecification */
    claimUserRoleSpecification?: ClaimUserRoleSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:string */
    assignmentNotes?: string;
    /** s:boolean */
    setAssigneeAsInsuredContact?: string;
    /** customFields */
    customFields?: CustomFields;
}
