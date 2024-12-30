import { FromUserIdSpecification } from "./FromUserIdSpecification";

/**
 * Attendees
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Attendees {
    /** UserIDSpecification[] */
    UserIDSpecification?: Array<FromUserIdSpecification>;
}
