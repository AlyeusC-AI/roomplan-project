import { AddClaimAssigneeResult } from "./AddClaimAssigneeResult";
import { UserProfile } from "./UserProfile";

/** UpdateUserResponse */
export interface UpdateUserResponse {
    /** UpdateUserResult */
    UpdateUserResult?: AddClaimAssigneeResult;
    /** userProfile */
    userProfile?: UserProfile;
}
