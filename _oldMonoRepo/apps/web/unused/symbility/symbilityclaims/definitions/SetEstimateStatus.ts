import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetEstimateStatus */
export interface SetEstimateStatus {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    estimateID?: string;
    /** EstimateStatus|s:string|InProgress,Completed,Approved,ReadyForReview,RejectedReview,RejectedApproval,Unknown,Cancelled */
    estimateStatus?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
