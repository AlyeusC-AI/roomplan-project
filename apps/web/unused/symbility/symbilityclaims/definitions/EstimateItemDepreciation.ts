import { DepreciationApplicability } from "./DepreciationApplicability";

/**
 * EstimateItemDepreciation
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface EstimateItemDepreciation {
    /** ItemDepreciationType|s:string|None,Fixed,PerYear,Flat,LifeExpectancy,Unknown,TableAlternate */
    DepreciationType?: string;
    /** s:decimal */
    DepreciationAge?: string;
    /** ItemDepreciationUsage|s:string|None,New,Light,Normal,Heavy,Unknown */
    DepreciationUsage?: string;
    /** s:decimal */
    DepreciationFirstYear?: string;
    /** s:decimal */
    DepreciationAdditionalYear?: string;
    /** s:decimal */
    DepreciationMaximum?: string;
    /** s:decimal */
    DepreciationUsefulLife?: string;
    /** s:decimal */
    DepreciationFlat?: string;
    /** s:decimal */
    DepreciationFixed?: string;
    /** s:boolean */
    RecoverableDepreciation?: string;
    /** DepreciationApplicability */
    DepreciationApplicability?: DepreciationApplicability;
}
