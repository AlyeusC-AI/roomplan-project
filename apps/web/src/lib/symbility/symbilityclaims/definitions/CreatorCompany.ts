import { InsuredAddress } from "./InsuredAddress";
import { Users } from "./Users";

/**
 * CreatorCompany
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface CreatorCompany {
    /** Address */
    Address?: InsuredAddress;
    /** Users */
    Users?: Users;
}
