import { PaidWhenIncurredTotals } from "./PaidWhenIncurredTotals";
import { Subcoverages } from "./Subcoverages";

/**
 * EstimateCoverage
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateCoverage {
    /** PaidWhenIncurredTotals */
    PaidWhenIncurredTotals?: PaidWhenIncurredTotals;
    /** Subcoverages */
    Subcoverages?: Subcoverages;
}
