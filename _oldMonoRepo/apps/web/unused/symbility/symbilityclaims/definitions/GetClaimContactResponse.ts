import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { CreatorUser } from "./CreatorUser";

/** GetClaimContactResponse */
export interface GetClaimContactResponse {
    /** GetClaimContactResult */
    GetClaimContactResult?: AddClaimAssigneeResult;
    /** user */
    user?: CreatorUser;
}
