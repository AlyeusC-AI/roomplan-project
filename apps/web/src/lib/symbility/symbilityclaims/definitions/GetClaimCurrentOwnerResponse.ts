import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { CreatorUser } from "./CreatorUser";

/** GetClaimCurrentOwnerResponse */
export interface GetClaimCurrentOwnerResponse {
    /** GetClaimCurrentOwnerResult */
    GetClaimCurrentOwnerResult?: AddClaimAssigneeResult;
    /** user */
    user?: CreatorUser;
}
