import { ExternalDocuments } from "./ExternalDocuments";

/**
 * ClaimPayment
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.symbility.net/webservices/`
 */
export interface ClaimPayment {
    /** ExternalDocuments */
    ExternalDocuments?: ExternalDocuments;
    /** s:dateTime */
    ApprovedDate?: string;
}
