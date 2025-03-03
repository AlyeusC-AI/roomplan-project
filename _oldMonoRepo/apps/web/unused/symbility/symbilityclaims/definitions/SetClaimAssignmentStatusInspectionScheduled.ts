import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimAssignmentStatusInspectionScheduled */
export interface SetClaimAssignmentStatusInspectionScheduled {
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
    inspectionScheduledForDate?: string;
}
