import { EstimateIDs } from "./EstimateIDs";
import { FormIDs } from "./FormIDs";

/**
 * Questionnaire
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface Questionnaire {
    /** EstimateIDs */
    EstimateIDs?: EstimateIDs;
    /** FormIDs */
    FormIDs?: FormIDs;
}
