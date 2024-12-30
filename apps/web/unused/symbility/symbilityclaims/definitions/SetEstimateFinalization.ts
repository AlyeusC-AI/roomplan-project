import { ClaimIdSpecification } from "./ClaimIdSpecification";
import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/** SetEstimateFinalization */
export interface SetEstimateFinalization {
    /** claimIDSpecification */
    claimIDSpecification?: ClaimIdSpecification;
    /** companyIDSpecification */
    companyIDSpecification?: CompanyIdSpecification;
    /** s:int */
    estimateID?: string;
    /** EstimateFinalizationStatus|s:string|None,CashSettled,Invoiced,Unknown */
    status?: string;
    /** s:string */
    referenceNumber?: string;
    /** s:dateTime */
    date?: string;
    /** fromUserIDSpecification */
    fromUserIDSpecification?: FromUserIdSpecification;
}
