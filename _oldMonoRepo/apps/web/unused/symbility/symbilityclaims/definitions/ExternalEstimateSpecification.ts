import { EstimateCoverages } from "./EstimateCoverages";
import { PaidWhenIncurredTotals } from "./PaidWhenIncurredTotals";

/**
 * ExternalEstimateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ExternalEstimateSpecification {
    /** PaidWhenIncurredTotals */
    PaidWhenIncurredTotals?: PaidWhenIncurredTotals;
    /** EstimateCoverages */
    EstimateCoverages?: EstimateCoverages;
}
