import { EstimateCoverages } from "./EstimateCoverages";
import { EstimateItems } from "./EstimateItems";
import { MinimumCharge } from "./MinimumCharge";
import { MinimumChargeAdjustmentItems } from "./MinimumChargeAdjustmentItems";
import { OverheadAndProfitInfo } from "./OverheadAndProfitInfo";
import { PaidWhenIncurredTotals } from "./PaidWhenIncurredTotals";
import { TaxInfo } from "./TaxInfo";

/**
 * estimate
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Estimate {
    /** s:dateTime */
    UserCreationDate?: string;
    /** MinimumCharge */
    MinimumCharge?: MinimumCharge;
    /** TaxInfo */
    TaxInfo?: TaxInfo;
    /** OverheadAndProfitInfo */
    OverheadAndProfitInfo?: OverheadAndProfitInfo;
    /** PaidWhenIncurredTotals */
    PaidWhenIncurredTotals?: PaidWhenIncurredTotals;
    /** Coverages */
    Coverages?: EstimateCoverages;
    /** s:dateTime */
    FinalizationSettlementOrInvoiceDate?: string;
    /** s:dateTime */
    FinalizationCreationDate?: string;
    /** EstimateItems */
    EstimateItems?: EstimateItems;
    /** MinimumChargeAdjustmentItems */
    MinimumChargeAdjustmentItems?: MinimumChargeAdjustmentItems;
    /** s:int */
    AuditScore?: string;
    /** s:dateTime */
    AuditScoreLastModificationDate?: string;
}
