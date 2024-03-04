
/**
 * TaxInfo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface TaxInfo {
    /** s:boolean */
    IsTax1OverriddenForSomeItems?: string;
    /** s:boolean */
    IsTax2OverriddenForSomeItems?: string;
    /** s:boolean */
    IsTax3OverriddenForSomeItems?: string;
    /** s:boolean */
    IsTax4OverriddenForSomeItems?: string;
    /** s:decimal */
    Tax1Rate?: string;
    /** s:decimal */
    Tax2Rate?: string;
    /** s:decimal */
    Tax3Rate?: string;
    /** s:decimal */
    Tax4Rate?: string;
}
