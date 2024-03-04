import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { ExternalDocument } from "./ExternalDocument";

/** GetClaimExternalDocumentResponse */
export interface GetClaimExternalDocumentResponse {
    /** GetClaimExternalDocumentResult */
    GetClaimExternalDocumentResult?: AddClaimAssigneeResult;
    /** externalDocument */
    externalDocument?: ExternalDocument;
}
