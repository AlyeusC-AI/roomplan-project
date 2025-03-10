import { EstimateItemSpecifications } from "./EstimateItemSpecifications";
import { EstimateItemUpdateSpecifications } from "./EstimateItemUpdateSpecifications";
import { ExternalEstimateSpecification } from "./ExternalEstimateSpecification";
import { MinimumCharge } from "./MinimumCharge";
import { OverheadAndProfitInfo } from "./OverheadAndProfitInfo";
import { TaxInfo } from "./TaxInfo";

/**
 * estimateUpdateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateUpdateSpecification {
    /** s:string */
    Name?: string;
    /** s:int */
    DefaultClaimCoverageID?: string;
    /** MinimumCharge */
    MinimumCharge?: MinimumCharge;
    /** TaxInfo */
    TaxInfo?: TaxInfo;
    /** OverheadAndProfitInfo */
    OverheadAndProfitInfo?: OverheadAndProfitInfo;
    /** s:string */
    Comments?: string;
    /** EstimateItemSpecifications */
    EstimateItemSpecifications?: EstimateItemSpecifications;
    /** EstimateItemUpdateSpecifications */
    EstimateItemUpdateSpecifications?: EstimateItemUpdateSpecifications;
    /** s:int */
    EstimateItemIDsToDelete?: Array<string>;
    /** ExternalEstimateSpecification */
    ExternalEstimateSpecification?: ExternalEstimateSpecification;
}
