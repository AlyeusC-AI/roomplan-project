import { ClaimSubcoverages } from "./ClaimSubcoverages";

/**
 * ClaimCoverage
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimCoverage {
    /** ClaimSubcoverages */
    ClaimSubcoverages?: ClaimSubcoverages;
    /** s:decimal */
    Reserve?: string;
    /** s:decimal */
    Limits?: string;
    /** s:decimal */
    Deductible?: string;
    /** s:decimal */
    DeductibleMinimumAmount?: string;
    /** s:decimal */
    DeductibleMaximumRate?: string;
}
