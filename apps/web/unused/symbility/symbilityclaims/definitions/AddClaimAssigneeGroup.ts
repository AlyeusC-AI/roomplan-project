import { AssigneeGroupIdSpecification } from "./AssigneeGroupIdSpecification";
import { AssigneeGroupOptions } from "./AssigneeGroupOptions";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimAssigneeGroup */
export interface AddClaimAssigneeGroup {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** s:string */
    assignmentTypeCode?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeGroupIDSpecification */
    assigneeGroupIDSpecification?: AssigneeGroupIdSpecification;
    /** assigneeGroupOptions */
    assigneeGroupOptions?: AssigneeGroupOptions;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:string */
    assignmentNotes?: string;
    /** s:boolean */
    setAssigneeAsInsuredContact?: string;
    /** customFields */
    customFields?: CustomFields;
}
