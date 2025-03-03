import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetClaimPaymentStatus */
export interface SetClaimPaymentStatus {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** s:int */
    paymentID?: string;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** ClaimPaymentStatus|s:string|None,Pending,Submitted,Approved,Cancelled,Rejected,Unknown */
    paymentStatus?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
