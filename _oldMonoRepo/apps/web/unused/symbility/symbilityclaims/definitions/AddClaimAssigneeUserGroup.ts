import { AssigneeUserGroupIdSpecification } from "./AssigneeUserGroupIdSpecification";
import { AssigneeUserGroupOptions } from "./AssigneeUserGroupOptions";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimAssigneeUserGroup */
export interface AddClaimAssigneeUserGroup {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** s:string */
    assignmentTypeCode?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeUserGroupIDSpecification */
    assigneeUserGroupIDSpecification?: AssigneeUserGroupIdSpecification;
    /** assigneeUserGroupOptions */
    assigneeUserGroupOptions?: AssigneeUserGroupOptions;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:string */
    assignmentNotes?: string;
    /** s:boolean */
    setAssigneeAsInsuredContact?: string;
    /** customFields */
    customFields?: CustomFields;
}
