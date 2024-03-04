import { CreatorCompany } from "./CreatorCompany";

/**
 * DelegatedAuthority
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface DelegatedAuthority {
    /** Company[] */
    Company?: Array<CreatorCompany>;
}
