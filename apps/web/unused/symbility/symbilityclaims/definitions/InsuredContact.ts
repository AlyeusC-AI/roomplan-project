import { CreatorCompany } from "./CreatorCompany";
import { CreatorUser } from "./CreatorUser";

/**
 * InsuredContact
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface InsuredContact {
    /** Company */
    Company?: CreatorCompany;
    /** User */
    User?: CreatorUser;
}
