import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";

/** GetClaimDocument_v2Response */
export interface GetClaimDocumentV2Response {
    /** GetClaimDocument_v2Result */
    GetClaimDocument_v2Result?: AddClaimAssigneeResult;
    /** s:base64Binary */
    claimDocument?: string;
}
