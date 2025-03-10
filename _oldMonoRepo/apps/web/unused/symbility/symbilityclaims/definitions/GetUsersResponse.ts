import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { UserProfiles } from "./UserProfiles";

/** GetUsersResponse */
export interface GetUsersResponse {
    /** GetUsersResult */
    GetUsersResult?: AddClaimAssigneeResult;
    /** userProfiles */
    userProfiles?: UserProfiles;
}
