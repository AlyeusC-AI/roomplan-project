import { EstimateItemSpecifications } from "./EstimateItemSpecifications";
import { ExternalEstimateSpecification } from "./ExternalEstimateSpecification";
import { MinimumCharge } from "./MinimumCharge";
import { OverheadAndProfitInfo } from "./OverheadAndProfitInfo";
import { TaxInfo } from "./TaxInfo";

/**
 * estimateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateSpecification {
    /** s:int */
    DefaultClaimCoverageID?: string;
    /** MinimumCharge */
    MinimumCharge?: MinimumCharge;
    /** TaxInfo */
    TaxInfo?: TaxInfo;
    /** OverheadAndProfitInfo */
    OverheadAndProfitInfo?: OverheadAndProfitInfo;
    /** EstimateItemSpecifications */
    EstimateItemSpecifications?: EstimateItemSpecifications;
    /** ExternalEstimateSpecification */
    ExternalEstimateSpecification?: ExternalEstimateSpecification;
}
