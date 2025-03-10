import { InsuredAddress } from "./InsuredAddress";

/**
 * CompanySpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface CompanySpecification {
    /** Address */
    Address?: InsuredAddress;
}
