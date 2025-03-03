import { EstimateItemContents } from "./EstimateItemContents";
import { EstimateItemDepreciation } from "./EstimateItemDepreciation";
import { EstimateItemNotes } from "./EstimateItemNotes";

/**
 * EstimateItem
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateItem {
    /** s:int */
    ClaimCoverageID?: string;
    /** s:int */
    ClaimSubcoverageID?: string;
    /** EstimateItemDepreciation */
    EstimateItemDepreciation?: EstimateItemDepreciation;
    /** EstimateItemContents */
    EstimateItemContents?: EstimateItemContents;
    /** EstimateItemNotes */
    EstimateItemNotes?: EstimateItemNotes;
}
