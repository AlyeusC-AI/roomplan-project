import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimAssignmentStatusJobScheduled */
export interface SetClaimAssignmentStatusJobScheduled {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    assignmentID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
    /** s:dateTime */
    eventDate?: string;
    /** s:dateTime */
    scheduledJobStartDate?: string;
    /** s:dateTime */
    scheduledJobCompleteDate?: string;
}
