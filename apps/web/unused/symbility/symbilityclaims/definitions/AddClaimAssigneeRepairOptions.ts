import { AssigneeRepairOptions } from "./AssigneeRepairOptions";
import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { CustomFields } from "./CustomFields";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** AddClaimAssigneeRepairOptions */
export interface AddClaimAssigneeRepairOptions {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** s:int */
    estimateID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** assigneeRepairOptions */
    assigneeRepairOptions?: AssigneeRepairOptions;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:string */
    assignmentNotes?: string;
    /** s:boolean */
    setAssigneeAsInsuredContact?: string;
    /** customFields */
    customFields?: CustomFields;
}
