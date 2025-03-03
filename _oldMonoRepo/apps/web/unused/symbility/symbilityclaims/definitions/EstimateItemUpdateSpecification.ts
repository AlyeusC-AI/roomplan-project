import { EstimateItemContents } from "./EstimateItemContents";
import { EstimateItemDepreciation } from "./EstimateItemDepreciation";
import { EstimateItemNoteIDsToDelete } from "./EstimateItemNoteIDsToDelete";
import { EstimateItemNoteSpecifications } from "./EstimateItemNoteSpecifications";
import { EstimateItemNoteUpdateSpecifications } from "./EstimateItemNoteUpdateSpecifications";
import { ExternalEstimateItemSpecification } from "./ExternalEstimateItemSpecification";
import { Links } from "./Links";
import { Links2 } from "./Links2";

/**
 * EstimateItemUpdateSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateItemUpdateSpecification {
    /** s:string */
    ItemDescription?: string;
    /** s:string */
    ActionName?: string;
    /** s:string */
    GradeDescription?: string;
    /** s:int */
    ClaimCoverageID?: string;
    /** s:int */
    ClaimSubcoverageID?: string;
    /** s:boolean */
    Provisional?: string;
    /** s:boolean */
    IncludeSubtractions?: string;
    /** s:decimal */
    Waste?: string;
    /** s:decimal */
    UnitMaterials?: string;
    /** s:decimal */
    UnitLabor?: string;
    /** s:decimal */
    UnitHours?: string;
    /** s:decimal */
    UnitEquipment?: string;
    /** s:decimal */
    UnitMarketConditions?: string;
    /** s:boolean */
    ApplyTax1?: string;
    /** s:boolean */
    ApplyTax2?: string;
    /** s:boolean */
    ApplyTax3?: string;
    /** s:boolean */
    ApplyTax4?: string;
    /** s:boolean */
    ApplyOverheadAndProfit?: string;
    /** EstimateItemDepreciation */
    EstimateItemDepreciation?: EstimateItemDepreciation;
    /** Links */
    Links?: Links;
    /** Links2 */
    Links2?: Links2;
    /** s:boolean */
    Credit?: string;
    /** s:decimal */
    Quantity?: string;
    /** s:decimal */
    MaterialsQuantityBundleSize?: string;
    /** s:string */
    PaidWhenIncurredReason?: string;
    /** s:string */
    PaidWhenIncurredGroup?: string;
    /** s:boolean */
    CostIncurred?: string;
    /** EstimateItemContents */
    EstimateItemContents?: EstimateItemContents;
    /** EstimateItemNoteSpecifications */
    EstimateItemNoteSpecifications?: EstimateItemNoteSpecifications;
    /** EstimateItemNoteUpdateSpecifications */
    EstimateItemNoteUpdateSpecifications?: EstimateItemNoteUpdateSpecifications;
    /** EstimateItemNoteIDsToDelete */
    EstimateItemNoteIDsToDelete?: EstimateItemNoteIDsToDelete;
    /** ExternalEstimateItemSpecification */
    ExternalEstimateItemSpecification?: ExternalEstimateItemSpecification;
}
