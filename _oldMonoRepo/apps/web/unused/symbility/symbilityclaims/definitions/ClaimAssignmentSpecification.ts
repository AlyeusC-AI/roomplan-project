import { CompanyIdSpecification } from "./CompanyIdSpecification";
import { FromUserIdSpecification } from "./FromUserIdSpecification";

/**
 * ClaimAssignmentSpecification
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimAssignmentSpecification {
    /** Assignee */
    Assignee?: CompanyIdSpecification;
    /** InternalAssignee */
    InternalAssignee?: FromUserIdSpecification;
}
