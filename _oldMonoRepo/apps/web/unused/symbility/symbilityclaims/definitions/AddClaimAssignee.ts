import { AssigneeGroupIdSpecification } from "./AssigneeGroupIdSpecification";
import { ClaimAssignmentOption } from "./ClaimAssignmentOption";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimAssignee */
export interface AddClaimAssignee {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** s:string */
    assignmentTypeCode?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeCompanyIDSpecification */
    assigneeCompanyIDSpecification?: CompanyIdSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** CompanyRole|s:string|Assignee,Peer,Unknown */
    companyRole?: string;
    /** assigneeGroupIDSpecification */
    assigneeGroupIDSpecification?: AssigneeGroupIdSpecification;
    /** claimAssignmentOption */
    claimAssignmentOption?: ClaimAssignmentOption;
    /** s:string */
    assignmentNotes?: string;
    /** s:boolean */
    setAssigneeAsInsuredContact?: string;
    /** customFields */
    customFields?: CustomFields;
}
